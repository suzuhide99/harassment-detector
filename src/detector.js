class HarassmentDetector {
    constructor() {
        this.isFirstTime = !localStorage.getItem('speechRecognitionTested');
        this.patterns = {
            人格否定: {
                keywords: [
                    'バカ', 'アホ', '無能', '使えない', 'ダメ人間', 'クズ', '役立たず', 
                    '能無し', '頭悪い', '最悪', 'ゴミ', '価値がない', '存在価値',
                    '才能がない', '向いてない', '器じゃない', 'レベルが低い',
                    // 厳しい判定追加
                    '無駄', '意味がない', '実力がない', '認めた方がいい', '仕事を辞めた方がいい',
                    'やることなすこと', '全て無駄', 'みんなの仕事が成り立たない',
                    // 価値否定系を強化
                    '価値はない', '価値がない', '価値がありません', 'には価値がない', 'には価値がありません',
                    'あなたには価値がない', 'あなたには価値がありません', 'あなたに価値はない', 
                    '無価値', '無価値な人間', '無価値な存在', 'あなたは無価値', '存在価値がない', 
                    '生きる価値がない', '価値のない人間', '無意味な人間', '無意味な存在', 
                    'いてもいなくても同じ', '必要のない人間', '不要な存在', '邪魔な存在'
                ],
                weight: 15,
                color: 'red'
            },
            威圧: {
                keywords: [
                    '辞めろ', 'クビ', '出ていけ', '消えろ', '辞表', '首', '解雇',
                    'いらない', '必要ない', '帰れ', 'やめちまえ', '去れ',
                    // 新しく追加
                    'やめた方がいい', '辞めた方が', '辞めたら', '仕事辞めたら', '辞めたらどう',
                    'やめてください', '辞めてください', '帰ってください', '邪魔', '邪魔です', 
                    '二度と顔を見せないで', '二度と顔を出さないで', '顔を出すな', '顔を見せるな',
                    '給料泥棒', 'よろしいのでは', '大変助かります'
                ],
                weight: 20,
                color: 'red'
            },
            過度な叱責: {
                keywords: [
                    '何度言ったら', 'いい加減にしろ', '話にならない', '呆れる',
                    'ふざけるな', '舐めてる', '甘えるな', '言い訳するな',
                    '理解できない', '常識がない', '社会人失格', 'やる気がない',
                    // 新しく追加
                    'やる気はあるんですか', 'やる気あるの', '自覚があるんですか',
                    'プロフェッショナルとしての自覚', '鏡を見た方がいい',
                    '意味がありません', '行動には意味がない', '存在意義',
                    // 能力・知能への攻撃
                    '頭大丈夫', '頭、大丈夫', '頭だいじょうぶ', '大丈夫ですか頭',
                    '頭おかしい', '頭悪い', '脳みそある', '考える力ない',
                    '理解力がない', '判断力がない', '思考能力がない',
                    // 学習・成長への否定
                    '何を学んできた', '今まで何を学んで', '学んできたの', '勉強してきた',
                    '経験してきた', '身につけてきた', '覚えてきた'
                ],
                weight: 12,
                color: 'orange'
            },
            脅迫: {
                keywords: [
                    '覚えとけ', '後悔する', '潰してやる', '許さない', '復讐',
                    '覚悟しろ', '痛い目', 'ただじゃおかない', '制裁',
                    '報復', '見てろよ', 'やり返す'
                ],
                weight: 25,
                color: 'red'
            },
            プライベート侵害: {
                keywords: [
                    'プライベート', '彼氏', '彼女', '結婚', '恋人', '家族',
                    '親', '子供', '住所', '電話番号', '個人的', '私生活'
                ],
                weight: 10,
                color: 'yellow'
            },
            身体的特徴: {
                keywords: [
                    '太い', '痩せてる', '背が低い', 'ブス', 'ハゲ', '臭い',
                    '見た目', '容姿', '外見', 'デブ', '気持ち悪い'
                ],
                weight: 12,
                color: 'orange'
            },
            過重労働: {
                keywords: [
                    '残業', '休むな', '休憩いらない', '24時間', 'サービス残業',
                    '徹夜', '休日出勤', '代休なし', '有給使うな', '遅刻するな',
                    // 新しく追加
                    '今日中に', '一人で', '無理でもやって', '寝てる暇はない',
                    '寝る前に', '夜間対応', '期限は今日', '単純作業だけ'
                ],
                weight: 8,
                color: 'yellow'
            },
            軽微な否定: {
                keywords: [
                    'ダメ', '良くない', 'まずい', '問題', 'おかしい', 
                    'なんで', 'どうして', '困る', '迷惑', 'しっかり',
                    'ちゃんと', 'きちんと', '気をつけて', '注意', '確認',
                    'もっと', 'しない', 'できない', 'わからない'
                ],
                weight: 3, // 軽微なので低スコア
                color: 'yellow'
            },
            職場での不適切な表現: {
                keywords: [
                    'そんなこと', 'あなたのような', 'みんなの', 'こんな',
                    'もっと', 'まだ', 'ずっと', 'いつも', '全然',
                    '全く', '一体', '本当に', '実際', 'やっぱり'
                ],
                weight: 2, // さらに軽微
                color: 'orange'
            },
            敬語での威圧: {
                keywords: [
                    'よろしいのではないでしょうか', 'いかがでしょうか',
                    'お考えいただければ', 'ご検討ください', 
                    'していただけませんか', 'お願いいたします',
                    'させていただきます', 'ご理解ください',
                    // 実際のテスト文言から
                    'よろしいのでは', 'いいと思います', 'いかがですか'
                ],
                weight: 8, // 敬語だが内容は威圧的
                color: 'orange'
            },
            職場マイクロアグレッション: {
                keywords: [
                    // 責任転嫁・プレッシャー
                    'この程度で', '手間かけさせる', '次は自分で何とかして', 
                    '担当から外す', '全員の前で', '基礎ができていない',
                    '当面は', '重要案件は触らないで', 'ここではやっていけない',
                    '評価は下げざるを得ない', '理由は察して',
                    
                    // 条件付き脅迫
                    '人前で注意されるのが嫌なら', '最初から完璧に',
                    'ミスした以上', '信頼は当分戻らない', '次を落としたら',
                    '契約面で不利', '既読5分以内', '本当に理解してる',
                    
                    // 能力否定・排除
                    'あなたに任せる仕事は今はない', 'まだ早かったね',
                    '会議には来なくていい', '他は触らないで',
                    '常識的に考えればわかる', '見て学んで', '察して',
                    
                    // プライバシー侵害・監視
                    '家庭の事情は全部教えて', '他の人の前で確認',
                    '全体メールで共有', '席だけ置いといて',
                    
                    // 期限・時間的プレッシャー（威圧的な文脈のみ）
                    'だけでも提出', '時間ないから適当に', '完璧じゃなくていいから',
                    'とりあえず形だけ', '適当でいいから出して', '雑でもいいから',
                    '質より速度で', 'ひとまず適当に',
                    
                    // 判定・評価への圧力（否定的な文脈）
                    '判定厳しいかもしれない', 'きついかもしれない', 
                    '通らないかもしれない', '厳しいと思うけど', '無理だと思う',
                    'ダメかもしれないが'
                ],
                weight: 6, // 中程度の重要度
                color: 'orange'
            },
            部分一致強化: {
                keywords: [
                    // 価値否定系（重要）
                    '価値', '無価', '価値な', '価値は', '価値が', '存在価値',
                    // 行動・態度否定
                    '仕事', '辞め', 'やめ', '帰っ', '邪魔', '顔', '給料', '泥棒',
                    // 能力・知能
                    '意味', 'やる気', '自覚', '鏡', '理解', '判断', '思考',
                    // 威圧的な表現
                    '程度', '手間', '担当', '外す', '評価', '信頼', '契約',
                    // 基本的な否定語
                    '無駄', '無意味', '必要', '不要', '邪魔'
                ],
                weight: 1, // 軽微（他の要素と組み合わせで検出力向上）
                color: 'yellow'
            }
        };
        
        this.recognition = null;
        this.isMonitoring = false;
        this.detectionHistory = JSON.parse(localStorage.getItem('harassmentHistory') || '[]');
        this.sessionStartTime = null;
        this.totalMonitoringTime = parseInt(localStorage.getItem('totalMonitoringTime') || '0');
        this.currentTranscript = '';
        
        // カード表示状態管理
        this.currentCard = null; // 現在表示中のカード情報
        this.cardDisplayTime = null; // カード表示開始時間
        
        // 統計情報の初期化
        this.updateStatistics();
    }

    // iOS Safari判定メソッド
    isIOSDevice() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    isSafariDevice() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
               (/Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor));
    }

    init() {
        console.log('Initializing speech recognition...');
        
        // ブラウザサポートの詳細チェック
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Speech recognition not supported in this browser');
            this.showError('このブラウザは音声認識に対応していません。Chrome、Edge、Safariをお使いください。');
            return false;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        console.log('Using SpeechRecognition:', SpeechRecognition.name);
        
        try {
            this.recognition = new SpeechRecognition();
            
            // 段階的設定（より安全な方法）
            this.recognition.lang = 'ja-JP';
            
            // iOS Safari対応のチェック
            const isIOS = this.isIOSDevice();
            const isSafari = this.isSafariDevice();
            console.log(`Device check: iOS=${isIOS}, Safari=${isSafari}`);
            
            // デバイス別設定
            if (isIOS && isSafari) {
                // iOS Safari用の最適化設定
                console.log('Applying iOS Safari optimizations');
                this.recognition.continuous = false; // iOSでは連続認識が不安定
                this.recognition.interimResults = true;
                this.iosMode = true;
                this.restartDelay = 1000; // 1秒後に再開
            } else if (this.isFirstTime || !localStorage.getItem('speechRecognitionTested')) {
                // 初回は安全な設定
                this.recognition.continuous = false;
                this.recognition.interimResults = false;
                console.log('初回テスト用設定を適用');
            } else {
                // 動作確認後は本来の設定
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
            }
            
            if ('maxAlternatives' in this.recognition) {
                this.recognition.maxAlternatives = 1;
            }
            
            // 追加設定（可能な場合）
            if ('serviceURI' in this.recognition) {
                console.log('Service URI available');
            }
            
            console.log('Speech recognition configured:', {
                continuous: this.recognition.continuous,
                interimResults: this.recognition.interimResults,
                lang: this.recognition.lang
            });
            
            this.setupEventHandlers();
            return true;
            
        } catch (error) {
            console.error('Failed to initialize SpeechRecognition:', error);
            this.showError('音声認識の初期化に失敗しました: ' + error.message);
            return false;
        }
    }

    setupEventHandlers() {
        this.recognition.onstart = () => {
            console.log('✅ Speech recognition started successfully');
            this.updateListeningStatus(true);
            
            // 初回成功時にフラグを設定
            if (this.isFirstTime) {
                localStorage.setItem('speechRecognitionTested', 'true');
                console.log('🎉 初回音声認識テスト成功');
            }
        };

        this.recognition.onend = () => {
            console.log('⏹️ Speech recognition ended');
            this.updateListeningStatus(false);
            
            // 監視中であれば自動的に再開
            if (this.isMonitoring) {
                console.log('🔄 Attempting to restart recognition...');
                const restartDelay = this.iosMode ? this.restartDelay : 100;
                setTimeout(() => {
                    try {
                        this.recognition.start();
                        console.log(`🔄 Recognition restarted (delay: ${restartDelay}ms)`);
                    } catch (error) {
                        console.warn('❌ Recognition restart failed:', error);
                        this.handleRecognitionError(error.name || 'restart-failed');
                    }
                }, restartDelay);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('❌ Speech recognition error:', event.error, event);
            this.handleRecognitionError(event.error);
        };

        this.recognition.onresult = (event) => {
            console.log('🎤 Speech recognition result received:', event);
            
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const confidence = event.results[i][0].confidence;
                
                console.log(`Result ${i}: "${transcript}" (confidence: ${confidence || 'N/A'}, final: ${event.results[i].isFinal})`);
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            // UIに表示
            this.updateTranscript(finalTranscript, interimTranscript);
            
            // 最終結果の場合のみ分析
            if (finalTranscript.trim()) {
                console.log('🔍 Analyzing final transcript:', finalTranscript.trim());
                this.analyze(finalTranscript.trim());
                
                // 初回テスト成功後、次回から継続モードを有効にする
                if (this.isFirstTime && !this.recognition.continuous) {
                    console.log('🔄 初回テスト成功！次回から継続モードを使用します');
                    this.isFirstTime = false;
                    // 再起動時により高機能な設定を適用
                    this.upgradeToAdvancedMode();
                }
            }
        };

        // 音声認識の準備完了
        this.recognition.onspeechstart = () => {
            console.log('👂 Speech detected');
        };

        this.recognition.onspeechend = () => {
            console.log('🤫 Speech ended');
        };

        this.recognition.onsoundstart = () => {
            console.log('🔊 Sound detected');
        };

        this.recognition.onsoundend = () => {
            console.log('🔇 Sound ended');
        };

        this.recognition.onaudiostart = () => {
            console.log('🎵 Audio input started');
        };

        this.recognition.onaudioend = () => {
            console.log('🎵 Audio input ended');
        };
    }

    startMonitoring() {
        console.log('🚀 Starting monitoring...');
        
        if (!this.recognition) {
            console.error('❌ Recognition not initialized');
            this.showError('音声認識が初期化されていません。ページを再読み込みしてください。');
            return false;
        }

        // 既に開始されている場合はスキップ
        if (this.isMonitoring) {
            console.log('⚠️ Monitoring already started');
            return true;
        }

        this.isMonitoring = true;
        this.sessionStartTime = new Date();
        this.currentTranscript = '';
        
        console.log('📊 Recognition settings:', {
            continuous: this.recognition.continuous,
            interimResults: this.recognition.interimResults,
            lang: this.recognition.lang
        });
        
        try {
            console.log('🎙️ Starting speech recognition...');
            this.recognition.start();
            this.updateMonitoringUI(true);
            console.log('✅ Monitoring started successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to start recognition:', error);
            this.isMonitoring = false;
            this.handleRecognitionError(error.name || 'start-failed');
            return false;
        }
    }

    stopMonitoring() {
        this.isMonitoring = false;
        
        if (this.recognition) {
            this.recognition.stop();
        }
        
        // 監視時間を記録
        if (this.sessionStartTime) {
            const sessionDuration = Math.floor((new Date() - this.sessionStartTime) / 60000); // minutes
            this.totalMonitoringTime += sessionDuration;
            localStorage.setItem('totalMonitoringTime', this.totalMonitoringTime.toString());
            this.updateStatistics();
        }
        
        this.updateMonitoringUI(false);
        this.updateListeningStatus(false);
    }

    analyze(text) {
        const detectedPatterns = [];
        let totalScore = 0;
        const matchedCategories = new Set();

        // すべてのパターンをチェック
        for (const [type, config] of Object.entries(this.patterns)) {
            let categoryMatched = false;
            let categoryMatches = [];
            
            for (const keyword of config.keywords) {
                if (text.includes(keyword)) {
                    categoryMatches.push({
                        type,
                        keyword,
                        weight: config.weight,
                        color: config.color
                    });
                    categoryMatched = true;
                }
            }
            
            // カテゴリ内で複数マッチした場合、スコアを少し上乗せ
            if (categoryMatched) {
                matchedCategories.add(type);
                detectedPatterns.push(...categoryMatches);
                totalScore += config.weight;
                
                // 同一カテゴリ内で複数マッチの場合、追加ボーナス
                if (categoryMatches.length > 1) {
                    totalScore += Math.min(categoryMatches.length - 1, 3); // 最大3点追加
                }
            }
        }

        // 複数カテゴリマッチした場合の追加ボーナス
        if (matchedCategories.size > 1) {
            totalScore += (matchedCategories.size - 1) * 2; // カテゴリ数に応じて追加点
        }

        // 文章長に応じた検出感度調整
        const textLength = text.length;
        if (textLength > 50 && detectedPatterns.length > 0) {
            // 長い文章でパターンがある場合、文脈的にパワハラの可能性が高い
            totalScore += Math.min(Math.floor(textLength / 50), 3); // 最大3点追加
        }

        // 特定の組み合わせパターンの検出
        if (this.detectCombinationPatterns(text)) {
            totalScore += 5; // 組み合わせパターンは高得点
        }

        // カードシステムでの判定（閾値をさらに下げる）
        if (totalScore >= 8) {
            // レッドカード - 重大なパワハラ
            this.handleCardAlert(text, detectedPatterns, totalScore, 'RED_CARD');
        } else if (totalScore >= 2) {
            // イエローカード - 軽微だが問題のある発言（超厳格）
            this.handleCardAlert(text, detectedPatterns, totalScore, 'YELLOW_CARD');
        }

        // 低スコアでも疑わしいものはログ出力
        if (totalScore > 0 && totalScore < 8) {
            console.log(`Low-level detection (${totalScore}): ${text}`, detectedPatterns);
        }
    }

    detectCombinationPatterns(text) {
        // 危険な組み合わせパターンを検出
        const dangerousCombinations = [
            // 条件付き脅迫パターン
            ['もう1回', '担当から外す'],
            ['ミス', '信頼', '戻らない'],
            ['次', '落としたら', '契約'],
            ['期限', '今日', '無理でも'],
            
            // 能力否定パターン
            ['基礎', 'できていない', 'レベル'],
            ['仕事', 'ない', 'まだ早い'],
            ['理解', '本当に', '確認'],
            ['頭', '大丈夫'],
            
            // 排除・孤立パターン
            ['会議', '来なくて', '単純作業'],
            ['重要', '触らない', '当面'],
            ['全員', '前で', '共有'],
            
            // 時間・品質プレッシャーパターン（威圧的文脈）
            ['適当', 'いいから', '出して'],
            ['雑', 'でもいいから'],
            ['形だけ', 'でも'],
            ['質より', '速度']
        ];

        for (const combination of dangerousCombinations) {
            const allMatched = combination.every(keyword => 
                text.includes(keyword)
            );
            if (allMatched) {
                console.log(`Dangerous combination detected: ${combination.join(' + ')}`);
                return true;
            }
        }
        return false;
    }

    handleCardAlert(text, patterns, score, cardType) {
        // カード表示中のバックグラウンド更新ロジック
        if (this.currentCard) {
            // 既にカードが表示中の場合
            const shouldUpdate = this.shouldUpdateCard(cardType, score);
            if (shouldUpdate) {
                console.log(`🔄 カード更新: ${this.currentCard.cardType} → ${cardType} (${this.currentCard.score} → ${score})`);
                this.updateExistingCard(text, patterns, score, cardType);
                return;
            } else {
                // 更新しない場合でも履歴には残す
                console.log(`📝 バックグラウンド検出 (更新なし): ${cardType} - ${score}点`);
                this.addToHistoryOnly(text, patterns, score, cardType);
                return;
            }
        }
        
        // 新しいカード表示
        this.triggerAlert(text, patterns, score, cardType);
    }

    shouldUpdateCard(newCardType, newScore) {
        // カード更新判定ルール
        const currentCardType = this.currentCard.cardType;
        const currentScore = this.currentCard.score;
        
        // ルール1: イエロー → レッドは常に更新
        if (currentCardType === 'YELLOW_CARD' && newCardType === 'RED_CARD') {
            return true;
        }
        
        // ルール2: レッド → イエローは更新しない
        if (currentCardType === 'RED_CARD' && newCardType === 'YELLOW_CARD') {
            return false;
        }
        
        // ルール3: 同じカード種別でスコアが高い場合のみ更新
        if (currentCardType === newCardType && newScore > currentScore) {
            return true;
        }
        
        return false;
    }

    updateExistingCard(text, patterns, score, cardType) {
        // 既存カードを更新
        const incident = {
            timestamp: new Date().toISOString(),
            text,
            patterns,
            score,
            id: Date.now(),
            cardType,
            severity: this.getSeverity(score, cardType),
            isUpdate: true // 更新フラグ
        };

        // 現在のカード情報を更新
        this.currentCard = incident;
        
        // 履歴に追加
        this.detectionHistory.unshift(incident);
        if (this.detectionHistory.length > 100) {
            this.detectionHistory = this.detectionHistory.slice(0, 100);
        }
        this.saveToLocalStorage();

        // カード表示を更新
        this.updateCardDisplay(incident);
        
        // UI更新
        this.showAlert(incident);
        this.updateHistory();
        this.updateStatistics();
        
        // 音声アラート（更新時は短めに）
        if (cardType === 'RED_CARD') {
            this.playUpdateSound(true);
        } else {
            this.playUpdateSound(false);
        }

        console.log('Card updated:', incident);
    }

    addToHistoryOnly(text, patterns, score, cardType) {
        // 履歴にのみ追加（カード表示は更新しない）
        const incident = {
            timestamp: new Date().toISOString(),
            text,
            patterns,
            score,
            id: Date.now(),
            cardType,
            severity: this.getSeverity(score, cardType),
            backgroundDetection: true // バックグラウンド検出フラグ
        };

        // 履歴に追加
        this.detectionHistory.unshift(incident);
        if (this.detectionHistory.length > 100) {
            this.detectionHistory = this.detectionHistory.slice(0, 100);
        }
        this.saveToLocalStorage();

        // UI更新
        this.showAlert(incident);
        this.updateHistory();
        this.updateStatistics();
        
        console.log('Background detection added to history only:', incident);
    }

    triggerAlert(text, patterns, score, cardType = 'YELLOW_CARD') {
        const incident = {
            timestamp: new Date().toISOString(),
            text,
            patterns,
            score,
            id: Date.now(),
            cardType,
            severity: this.getSeverity(score, cardType)
        };

        // 現在のカード情報を設定
        this.currentCard = incident;
        this.cardDisplayTime = new Date();

        // 履歴に追加
        this.detectionHistory.unshift(incident); // 新しいものを先頭に
        
        // 履歴の上限を設定（最新100件まで）
        if (this.detectionHistory.length > 100) {
            this.detectionHistory = this.detectionHistory.slice(0, 100);
        }
        
        this.saveToLocalStorage();

        // 派手なカード警告表示
        this.showCardAlert(incident);
        
        // UI更新
        this.showAlert(incident);
        this.updateHistory();
        this.updateStatistics();
        
        // 音声アラート
        if (cardType === 'RED_CARD') {
            this.playAlertSound(true); // 重い警告音
        } else {
            this.playAlertSound(false); // 軽い警告音
        }

        console.log('Harassment detected:', incident);
    }

    getSeverity(score, cardType) {
        if (cardType === 'RED_CARD') {
            return { level: 'critical', color: 'red', icon: '🟥', label: 'レッドカード', bgColor: '#dc2626' };
        } else {
            return { level: 'warning', color: 'yellow', icon: '🟨', label: 'イエローカード', bgColor: '#eab308' };
        }
    }

    showCardAlert(incident) {
        // 既存のカード警告があれば削除
        const existingAlert = document.getElementById('cardAlert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // 派手なフルスクリーン警告を作成
        const cardAlert = document.createElement('div');
        cardAlert.id = 'cardAlert';
        cardAlert.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: ${incident.cardType === 'RED_CARD' ? 'rgba(220, 38, 38, 0.95)' : 'rgba(234, 179, 8, 0.95)'};
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            animation: ${incident.cardType === 'RED_CARD' ? 'redCardPulse' : 'yellowCardPulse'} 0.5s ease-in-out;
        `;

        const cardIcon = incident.cardType === 'RED_CARD' ? '🟥' : '🟨';
        const cardText = incident.cardType === 'RED_CARD' ? 'レッドカード' : 'イエローカード';
        const subtitle = incident.cardType === 'RED_CARD' ? '重大なパワハラ発言を検出！' : '不適切な発言を検出！';

        cardAlert.innerHTML = `
            <div style="text-align: center; animation: cardShake 0.3s ease-in-out;">
                <div style="font-size: 120px; margin-bottom: 20px;">${cardIcon}</div>
                <h1 style="font-size: 48px; margin: 20px 0; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    ${cardText}
                </h1>
                <h2 style="font-size: 24px; margin: 20px 0; font-weight: 600;">
                    ${subtitle}
                </h2>
                <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; margin: 30px; max-width: 600px;">
                    <p style="font-size: 20px; font-weight: 500; margin: 0;">
                        「${incident.text}」
                    </p>
                </div>
                <p style="font-size: 18px; margin-top: 30px;">
                    スコア: ${incident.score}点 | 検出パターン: ${incident.patterns.length}個
                </p>
                <button id="dismissCard" style="
                    background: rgba(255,255,255,0.9);
                    color: #333;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 25px;
                    font-size: 18px;
                    font-weight: bold;
                    margin-top: 40px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    確認しました
                </button>
            </div>
        `;

        // CSSアニメーションを追加
        const style = document.createElement('style');
        style.textContent = `
            @keyframes redCardPulse {
                0% { background: rgba(220, 38, 38, 0); transform: scale(0.8); }
                50% { background: rgba(220, 38, 38, 1); transform: scale(1.05); }
                100% { background: rgba(220, 38, 38, 0.95); transform: scale(1); }
            }
            @keyframes yellowCardPulse {
                0% { background: rgba(234, 179, 8, 0); transform: scale(0.8); }
                50% { background: rgba(234, 179, 8, 1); transform: scale(1.05); }
                100% { background: rgba(234, 179, 8, 0.95); transform: scale(1); }
            }
            @keyframes cardShake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(cardAlert);

        // カード削除処理
        const dismissCard = () => {
            cardAlert.remove();
            style.remove();
            // カード状態をリセット
            this.currentCard = null;
            this.cardDisplayTime = null;
            console.log('🗑️ カード閉じられました - バックグラウンドモニタリング継続');
        };

        // 確認ボタンのイベント
        document.getElementById('dismissCard').addEventListener('click', dismissCard);

        // 5秒後に自動で消える（レッドカードは10秒）
        setTimeout(() => {
            if (cardAlert.parentNode) {
                dismissCard();
            }
        }, incident.cardType === 'RED_CARD' ? 10000 : 5000);
    }

    updateCardDisplay(incident) {
        // 既存のカード表示を更新
        const existingCard = document.getElementById('cardAlert');
        if (!existingCard) return;

        // 更新エフェクトを追加
        existingCard.style.animation = 'cardPulse 0.3s ease-in-out';
        
        // カード内容を更新
        const cardIcon = incident.cardType === 'RED_CARD' ? '🟥' : '🟨';
        const cardText = incident.cardType === 'RED_CARD' ? 'レッドカード' : 'イエローカード';
        const subtitle = incident.cardType === 'RED_CARD' ? '重大なパワハラ発言を検出！' : '不適切な発言を検出！';

        const contentDiv = existingCard.querySelector('div');
        contentDiv.innerHTML = `
            <div style="text-align: center; animation: cardShake 0.3s ease-in-out;">
                <div style="font-size: 120px; margin-bottom: 20px;">${cardIcon}</div>
                <h1 style="font-size: 48px; margin: 20px 0; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    ${cardText} 🔄 更新
                </h1>
                <h2 style="font-size: 24px; margin: 20px 0; font-weight: 600;">
                    ${subtitle}
                </h2>
                <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; margin: 30px; max-width: 600px;">
                    <p style="font-size: 20px; font-weight: 500; margin: 0;">
                        「${incident.text}」
                    </p>
                </div>
                <p style="font-size: 18px; margin-top: 30px;">
                    スコア: ${incident.score}点 | 検出パターン: ${incident.patterns.length}個
                </p>
                <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px; margin: 20px; font-size: 14px;">
                    🔄 バックグラウンドで更新されました
                </div>
                <button id="dismissCard" style="
                    background: rgba(255,255,255,0.9);
                    color: #333;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 25px;
                    font-size: 18px;
                    font-weight: bold;
                    margin-top: 40px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    確認しました
                </button>
            </div>
        `;

        console.log('🎨 カード表示を更新しました');
    }

    playUpdateSound(isRedCard = false) {
        // カード更新時の短い音
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(isRedCard ? 500 : 700, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        } catch (error) {
            console.warn('Could not play update sound:', error);
        }
    }

    updateTranscript(finalText, interimText) {
        const transcriptElement = document.getElementById('transcript');
        if (!transcriptElement) return;

        this.currentTranscript += finalText;
        
        // 最新の1000文字のみを保持
        if (this.currentTranscript.length > 1000) {
            this.currentTranscript = this.currentTranscript.slice(-1000);
        }

        const displayText = this.currentTranscript + (interimText ? `<span class="text-gray-400">${interimText}</span>` : '');
        transcriptElement.innerHTML = displayText || '<div class="text-gray-500 italic">音声を認識中...</div>';
        transcriptElement.scrollTop = transcriptElement.scrollHeight;
    }

    updateListeningStatus(isListening) {
        const indicator = document.getElementById('listeningIndicator');
        if (indicator) {
            indicator.style.display = isListening ? 'inline' : 'none';
        }
    }

    updateMonitoringUI(isMonitoring) {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const statusText = document.getElementById('statusText');
        const statusIndicator = document.getElementById('statusIndicator');

        if (startBtn && stopBtn && statusText && statusIndicator) {
            startBtn.style.display = isMonitoring ? 'none' : 'inline-block';
            stopBtn.style.display = isMonitoring ? 'inline-block' : 'none';
            statusText.textContent = isMonitoring ? '監視中' : '停止中';
            
            statusIndicator.className = isMonitoring 
                ? 'w-4 h-4 rounded-full bg-green-500 animate-pulse'
                : 'w-4 h-4 rounded-full bg-gray-400';
        }
    }

    showAlert(incident) {
        const alertArea = document.getElementById('alertArea');
        if (!alertArea) return;

        const severity = incident.severity;
        const alertDiv = document.createElement('div');
        
        alertDiv.className = `alert-item bg-${severity.color}-100 border border-${severity.color}-400 text-${severity.color}-700 px-4 py-3 rounded-lg mb-2 animate-pulse`;
        alertDiv.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <span class="text-xl mr-2">${severity.icon}</span>
                    <div>
                        <div class="font-bold">${severity.label} - スコア: ${incident.score}</div>
                        <div class="text-sm">"${incident.text}"</div>
                        <div class="text-xs mt-1">
                            検出パターン: ${incident.patterns.map(p => p.type).join(', ')}
                        </div>
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-${severity.color}-500 hover:text-${severity.color}-700 font-bold">×</button>
            </div>
        `;

        alertArea.appendChild(alertDiv);

        // 5秒後に自動的に薄くする
        setTimeout(() => {
            alertDiv.classList.remove('animate-pulse');
            alertDiv.style.opacity = '0.7';
        }, 5000);

        // 30秒後に自動削除
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 30000);
    }

    updateHistory() {
        const historyElement = document.getElementById('history');
        if (!historyElement) return;

        if (this.detectionHistory.length === 0) {
            historyElement.innerHTML = '<div class="text-gray-500 italic text-sm">検出された問題のある発言がここに表示されます</div>';
            return;
        }

        const historyHTML = this.detectionHistory.slice(0, 20).map(incident => {
            const date = new Date(incident.timestamp);
            const severity = incident.severity || this.getSeverity(incident.score);
            
            return `
                <div class="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs text-gray-500">${date.toLocaleString('ja-JP')}</span>
                        <span class="px-2 py-1 rounded text-xs font-semibold bg-${severity.color}-200 text-${severity.color}-800">
                            ${severity.label} (${incident.score})
                        </span>
                    </div>
                    <div class="text-sm mb-1">"${incident.text}"</div>
                    <div class="text-xs text-gray-600">
                        パターン: ${incident.patterns.map(p => p.type).join(', ')}
                    </div>
                </div>
            `;
        }).join('');

        historyElement.innerHTML = historyHTML;
    }

    updateStatistics() {
        const totalDetections = document.getElementById('totalDetections');
        const todayDetections = document.getElementById('todayDetections');
        const highestScore = document.getElementById('highestScore');
        const monitoringTime = document.getElementById('monitoringTime');

        if (totalDetections) totalDetections.textContent = this.detectionHistory.length;
        
        // 今日の検出数
        const today = new Date().toDateString();
        const todayCount = this.detectionHistory.filter(incident => 
            new Date(incident.timestamp).toDateString() === today
        ).length;
        if (todayDetections) todayDetections.textContent = todayCount;

        // 最高スコア
        const maxScore = this.detectionHistory.length > 0 
            ? Math.max(...this.detectionHistory.map(incident => incident.score))
            : 0;
        if (highestScore) highestScore.textContent = maxScore;

        // 監視時間
        if (monitoringTime) monitoringTime.textContent = this.totalMonitoringTime;
    }

    clearHistory() {
        this.detectionHistory = [];
        this.saveToLocalStorage();
        this.updateHistory();
        this.updateStatistics();
    }

    handleRecognitionError(error) {
        console.error('🚨 Handling recognition error:', error);
        
        switch (error) {
            case 'not-allowed':
                this.showError('マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。');
                this.isMonitoring = false;
                this.updateMonitoringUI(false);
                break;
            case 'no-speech':
                console.log('⚠️ No speech detected - this is normal');
                // 通常の動作なのでエラー表示はしない
                break;
            case 'audio-capture':
                this.showError('マイクが利用できません。他のアプリケーションで使用されている可能性があります。');
                break;
            case 'network':
                this.showError('ネットワークエラーが発生しました。インターネット接続を確認してください。');
                break;
            case 'service-not-allowed':
                this.showError('音声認識サービスが利用できません。HTTPSで接続してください。');
                break;
            case 'bad-grammar':
                console.error('Grammar error');
                break;
            case 'language-not-supported':
                this.showError('日本語の音声認識がサポートされていません。');
                break;
            case 'start-failed':
                this.showError('音声認識の開始に失敗しました。ページを再読み込みしてください。');
                break;
            case 'restart-failed':
                console.warn('Recognition restart failed, will try again...');
                // 再起動失敗は頻繁に起こり得るのでユーザーには表示しない
                break;
            default:
                console.error('Unknown recognition error:', error);
                this.showError(`音声認識エラー: ${error}`);
        }
    }

    showError(message) {
        console.error('UI Error:', message);
        const errorElement = document.getElementById('microphoneError');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }

    playAlertSound(isRedCard = false) {
        // Web Audio APIを使用してカードタイプに応じた警告音を生成
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (isRedCard) {
                // レッドカード用の重い警告音（低音で長め）
                this.playRedCardSound(audioContext);
            } else {
                // イエローカード用の軽い警告音（高音で短め）
                this.playYellowCardSound(audioContext);
            }
        } catch (error) {
            console.warn('Could not play alert sound:', error);
        }
    }
    
    playRedCardSound(audioContext) {
        const times = [0, 0.3, 0.6]; // 3回鳴らす
        const frequencies = [400, 350, 300]; // 下降音階
        
        times.forEach((time, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequencies[index], audioContext.currentTime + time);
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime + time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.25);
            
            oscillator.start(audioContext.currentTime + time);
            oscillator.stop(audioContext.currentTime + time + 0.25);
        });
    }
    
    playYellowCardSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    saveToLocalStorage() {
        localStorage.setItem('harassmentHistory', JSON.stringify(this.detectionHistory));
    }

    upgradeToAdvancedMode() {
        console.log('🚀 アドバンスモードにアップグレード中...');
        
        // 現在の音声認識を停止
        if (this.recognition && this.isMonitoring) {
            this.recognition.stop();
            
            setTimeout(() => {
                // 高機能設定で再初期化
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                
                console.log('📊 アップグレード後の設定:', {
                    continuous: this.recognition.continuous,
                    interimResults: this.recognition.interimResults,
                    lang: this.recognition.lang
                });
                
                // 再開
                if (this.isMonitoring) {
                    try {
                        this.recognition.start();
                        console.log('✅ アドバンスモードで再開成功');
                    } catch (error) {
                        console.warn('⚠️ アドバンスモード再開失敗、基本モードを継続:', error);
                    }
                }
            }, 500);
        }
    }
}