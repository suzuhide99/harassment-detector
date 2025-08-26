// UI制御とイベントハンドリング
class UIController {
    constructor() {
        this.detector = new HarassmentDetector();
        this.isInitialized = false;
        this.init();
    }

    async init() {
        // DOM要素の取得
        this.elements = {
            startBtn: document.getElementById('startBtn'),
            stopBtn: document.getElementById('stopBtn'),
            statusText: document.getElementById('statusText'),
            statusIndicator: document.getElementById('statusIndicator'),
            transcript: document.getElementById('transcript'),
            alertArea: document.getElementById('alertArea'),
            history: document.getElementById('history'),
            clearHistory: document.getElementById('clearHistory'),
            microphoneError: document.getElementById('microphoneError'),
            listeningIndicator: document.getElementById('listeningIndicator')
        };

        // 検出器の初期化
        if (this.detector.init()) {
            this.isInitialized = true;
            this.setupEventListeners();
            console.log('UI Controller initialized successfully');
        } else {
            this.showError('お使いのブラウザは音声認識に対応していません。Chrome、Firefox、Safariの最新版をお試しください。');
            console.error('Speech recognition not supported');
        }

        // 初期状態の設定
        this.updateInitialState();
    }

    setupEventListeners() {
        // 開始ボタン（タッチイベント対応）
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => {
                this.startMonitoring();
            });
            this.elements.startBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.startMonitoring();
            });
        }

        // 停止ボタン（タッチイベント対応）
        if (this.elements.stopBtn) {
            this.elements.stopBtn.addEventListener('click', () => {
                this.stopMonitoring();
            });
            this.elements.stopBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.stopMonitoring();
            });
        }

        // 履歴クリアボタン
        if (this.elements.clearHistory) {
            this.elements.clearHistory.addEventListener('click', () => {
                this.clearHistory();
            });
        }

        // キーボードショートカット
        document.addEventListener('keydown', (event) => {
            // Ctrl+Spaceで開始/停止の切り替え
            if (event.ctrlKey && event.code === 'Space') {
                event.preventDefault();
                if (this.detector.isMonitoring) {
                    this.stopMonitoring();
                } else {
                    this.startMonitoring();
                }
            }

            // Escapeで停止
            if (event.key === 'Escape' && this.detector.isMonitoring) {
                this.stopMonitoring();
            }
        });

        // ページを閉じる前の警告
        window.addEventListener('beforeunload', (event) => {
            if (this.detector.isMonitoring) {
                event.preventDefault();
                event.returnValue = 'モニタリング中です。本当にページを離れますか？';
            }
        });

        // ページの可視性が変わった時の処理
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && this.detector.isMonitoring) {
                console.log('Page hidden while monitoring');
            } else if (document.visibilityState === 'visible' && this.detector.isMonitoring) {
                console.log('Page visible while monitoring');
            }
        });
    }

    updateInitialState() {
        // プライバシー保護：セッション開始時は空の履歴から開始
        this.detector.updateHistory();
        this.detector.updateStatistics();

        // ブラウザサポートのチェック
        this.checkBrowserSupport();

        // マイクアクセスのチェック
        this.checkMicrophoneAccess();
    }

    async checkBrowserSupport() {
        const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        
        if (!isSupported) {
            this.showError('このブラウザは音声認識に対応していません。Chrome、Edge、Safariの最新版をご利用ください。');
        }
    }

    async checkMicrophoneAccess() {
        console.log('🎤 Checking microphone access...');
        
        // MediaDevices APIの確認
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('❌ MediaDevices API not supported');
            this.showError('このブラウザはマイクアクセスをサポートしていません。');
            return false;
        }

        // HTTPS接続の確認
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            console.warn('⚠️ Not using HTTPS - speech recognition may not work');
            this.showError('音声認識にはHTTPS接続が必要です。本番環境ではHTTPSを使用してください。');
        }

        try {
            console.log('🔍 Requesting microphone permission...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            console.log('✅ Microphone access granted');
            console.log('🎙️ Audio tracks:', stream.getAudioTracks().map(track => ({
                label: track.label,
                kind: track.kind,
                enabled: track.enabled,
                readyState: track.readyState
            })));
            
            // すぐに停止
            stream.getTracks().forEach(track => track.stop());
            return true;
            
        } catch (error) {
            console.error('❌ Microphone access failed:', error);
            
            switch (error.name) {
                case 'NotAllowedError':
                    this.showError('マイクへのアクセスが拒否されました。ブラウザの設定でマイクの使用を許可してください。');
                    break;
                case 'NotFoundError':
                    this.showError('マイクが見つかりません。マイクが接続されているか確認してください。');
                    break;
                case 'NotReadableError':
                    this.showError('マイクが他のアプリケーションで使用されています。他のアプリを閉じてから再試行してください。');
                    break;
                default:
                    this.showError(`マイクアクセスエラー: ${error.message}`);
            }
            return false;
        }
    }

    async startMonitoring() {
        console.log('🚀 UI: Starting monitoring...');
        
        if (!this.isInitialized) {
            console.error('❌ UI not initialized');
            this.showError('アプリケーションが初期化されていません。ページを再読み込みしてください。');
            return;
        }

        // 既に実行中の場合
        if (this.detector.isMonitoring) {
            console.log('⚠️ Already monitoring');
            this.showNotification('既に監視中です。', 'warning');
            return;
        }

        try {
            console.log('🔍 Requesting microphone access...');
            // マイクアクセスの再確認
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            console.log('✅ Microphone access confirmed');
            // 即座に停止（テスト用）
            stream.getTracks().forEach(track => track.stop());
            
            // エラー表示をクリア
            this.hideError();
            
            // 監視開始
            console.log('▶️ Starting detector...');
            if (this.detector.startMonitoring()) {
                this.showNotification('監視を開始しました。話しかけてテストしてください。', 'success');
                console.log('✅ Monitoring started successfully');
            } else {
                console.error('❌ Detector failed to start');
                this.showError('監視の開始に失敗しました。コンソールを確認してください。');
            }
        } catch (error) {
            console.error('❌ Failed to start monitoring:', error);
            
            switch (error.name) {
                case 'NotAllowedError':
                    this.showError('マイクへのアクセスが拒否されました。ブラウザのアドレスバー付近のマイクアイコンをクリックして許可してください。');
                    break;
                case 'NotFoundError':
                    this.showError('マイクが見つかりません。マイクが接続されているか確認してください。');
                    break;
                case 'NotReadableError':
                    this.showError('マイクが他のアプリケーションで使用されています。他のアプリを閉じてから再試行してください。');
                    break;
                case 'AbortError':
                    this.showError('マイクアクセスが中断されました。再度お試しください。');
                    break;
                case 'OverconstrainedError':
                    this.showError('要求された音声設定がサポートされていません。');
                    break;
                default:
                    this.showError(`音声認識の開始に失敗しました: ${error.message}。ページを再読み込みしてお試しください。`);
            }
        }
    }

    stopMonitoring() {
        this.detector.stopMonitoring();
        this.showNotification('監視を停止しました。');
        console.log('Monitoring stopped');
    }

    clearHistory() {
        if (confirm('検出履歴をすべて削除しますか？この操作は元に戻せません。')) {
            this.detector.clearHistory();
            this.showNotification('履歴をクリアしました。');
        }
    }

    showError(message) {
        if (this.elements.microphoneError) {
            this.elements.microphoneError.textContent = message;
            this.elements.microphoneError.classList.remove('hidden');
        }
        
        // コンソールにも出力
        console.error('UI Error:', message);
    }

    hideError() {
        if (this.elements.microphoneError) {
            this.elements.microphoneError.classList.add('hidden');
        }
    }

    showNotification(message, type = 'info') {
        // 一時的な通知を表示
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white max-w-sm transform transition-all duration-300 translate-x-full`;
        
        // タイプによって色を設定
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500');
                break;
            case 'error':
                notification.classList.add('bg-red-500');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500');
                break;
            default:
                notification.classList.add('bg-blue-500');
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // アニメーション
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // 自動削除
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // デモ用のテスト機能
    runDemo() {
        if (!this.detector.isMonitoring) {
            this.showNotification('デモを実行するには、まず監視を開始してください。', 'warning');
            return;
        }

        const demoTexts = [
            'お疲れ様です',  // 正常
            'いい加減にしろよ', // 検出される
            '今日は良い天気ですね', // 正常
            'バカじゃないの', // 検出される
            'プロジェクトの進捗はいかがですか', // 正常
            'もう辞めちまえ' // 検出される
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index >= demoTexts.length) {
                clearInterval(interval);
                this.showNotification('デモが完了しました。', 'success');
                return;
            }

            this.detector.analyze(demoTexts[index]);
            this.detector.updateTranscript(demoTexts[index] + ' ', '');
            index++;
        }, 2000);

        this.showNotification('デモを開始します...', 'info');
    }

    // 統計情報の手動更新
    refreshStatistics() {
        this.detector.updateStatistics();
        this.showNotification('統計情報を更新しました。', 'success');
    }

    // エクスポート機能
    exportHistory() {
        if (this.detector.detectionHistory.length === 0) {
            this.showNotification('エクスポートする履歴がありません。', 'warning');
            return;
        }

        const data = {
            exportDate: new Date().toISOString(),
            totalIncidents: this.detector.detectionHistory.length,
            monitoringTime: this.detector.totalMonitoringTime,
            incidents: this.detector.detectionHistory
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `harassment-detection-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('履歴をエクスポートしました。', 'success');
    }
}

// ページ読み込み完了後にUI初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing UI...');
    window.uiController = new UIController();
    
    // デバッグ用のグローバル関数
    window.runDemo = () => window.uiController.runDemo();
    window.exportHistory = () => window.uiController.exportHistory();
    window.refreshStats = () => window.uiController.refreshStatistics();
});

// エラーハンドリング
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});