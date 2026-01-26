document.addEventListener('DOMContentLoaded', () => {
    const headerHeight = 60; // ヘッダーの高さ
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section');
    const header = document.querySelector('header');
    const topSection = document.getElementById('top');
    const floatingMenu = document.querySelector('.floatingMenu');

    // パフォーマンス最適化: throttle関数（requestAnimationFrameを使用）
    function throttle(func) {
        let ticking = false;
        return function(...args) {
            if (!ticking) {
                requestAnimationFrame(() => {
                    func.apply(this, args);
                    ticking = false;
                });
                ticking = true;
            }
        };
    }

    // 初期状態で確実にscrolledクラスを削除、フローティングメニューを非表示に
    header.classList.remove('scrolled');
    if (floatingMenu) {
        floatingMenu.classList.remove('visible');
    }

    // スクロールアニメーション（Intersection Observer）- 最適化版
    const observerOptions = {
        threshold: 0.15, // 0.1 → 0.15 に変更（トリガー回数削減）
        rootMargin: '0px 0px -60px 0px' // マージンを調整
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // 最適化: アニメーション後に監視を解除してメモリ節約
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // アニメーション対象の要素を監視（最適化: 監視対象を削減）
    // 大きな単位（セクション、主要コンテナ）のみを監視
    const animateElements = document.querySelectorAll(
        '.image-placeholder, .image-placeholder-large, ' +
        '.howtoUser, .hero-title'
    );

    animateElements.forEach(el => {
        el.classList.add('scroll-animate');
        observer.observe(el);
    });

    // ヘッダー背景色とフローティングメニューの表示を更新する関数
    function updateHeaderBackground() {
        const scrollY = window.pageYOffset;
        const topSectionHeight = topSection ? topSection.offsetHeight : 600; // デフォルト値を設定

        // トップセクションの終わりに近づいたらヘッダーの背景を変更
        if (scrollY > topSectionHeight - headerHeight - 50) {
            header.classList.add('scrolled');
            // フローティングメニューを表示
            if (floatingMenu) {
                floatingMenu.classList.add('visible');
            }
        } else {
            header.classList.remove('scrolled');
            // フローティングメニューを非表示
            if (floatingMenu) {
                floatingMenu.classList.remove('visible');
            }
        }
    }

    // カレント状態を更新する関数（最適化版）
    function updateCurrentNav() {
        let current = '';
        const scrollY = window.pageYOffset + headerHeight + 10;

        // 最適化: 現在のセクションを見つけたら早期リターン
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop) {
                current = section.getAttribute('id');
                break; // 見つかったらループを抜ける
            }
        }

        // 最適化: currentが変更されていない場合は処理をスキップ
        if (updateCurrentNav.lastCurrent === current) {
            return;
        }
        updateCurrentNav.lastCurrent = current;

        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && href.includes('#')) {
                const targetId = href.split('#')[1];
                if (targetId === current) {
                    item.classList.add('current');
                } else {
                    item.classList.remove('current');
                }
            }
        });
    }

    // スクロール処理（throttle適用で最適化）
    const throttledScroll = throttle(() => {
        updateCurrentNav();
        updateHeaderBackground();
    });

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // 初期ロード時にカレント状態とヘッダー背景色を設定
    updateCurrentNav();
    // 画像読み込み後に再度実行
    window.addEventListener('load', () => {
        updateHeaderBackground();
    });
    updateHeaderBackground();

    // よくある質問（タブ切り替え）
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // アコーディオン
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            header.classList.toggle('active');
            content.classList.toggle('active');
        });
    });

    // ハンバーガーメニュー
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const href = item.getAttribute('href');

                // 外部リンクの場合はそのまま処理
                if (href && href.startsWith('http')) {
                    return;
                }

                // ハッシュリンクの場合
                if (href && href.includes('#')) {
                    e.preventDefault();
                    const targetId = href.split('#')[1];
                    const targetSection = document.getElementById(targetId);

                    if (targetSection) {
                        const targetPosition = targetSection.offsetTop - headerHeight;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });

                        // スクロール完了後にカレント状態を更新
                        setTimeout(updateCurrentNav, 500);
                    }
                }

                // メニューを閉じる
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // ページ読み込み時のハッシュ処理
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const targetSection = document.getElementById(hash);
        if (targetSection) {
            setTimeout(() => {
                const targetPosition = targetSection.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                setTimeout(updateCurrentNav, 500);
            }, 0);
        }
    }

    // ドットインジケーター機能
    const scrollContainers = document.querySelectorAll('.scroll-container[data-scroll-indicator]');

    scrollContainers.forEach(container => {
        const indicatorId = container.dataset.scrollIndicator;
        const indicators = document.querySelector(`.scroll-indicators[data-indicators="${indicatorId}"]`);

        if (!indicators) return;

        const dots = indicators.querySelectorAll('.indicator-dot');
        // .image-placeholder または .news-card を取得
        let items = container.querySelectorAll('.image-placeholder');
        if (items.length === 0) {
            items = container.querySelectorAll('.news-card');
        }

        // スクロール位置に応じてアクティブなドットを更新
        function updateIndicators() {
            const scrollLeft = container.scrollLeft;
            const itemWidth = items[0].offsetWidth;
            const gap = 30; // CSSのgapと同じ値

            // 現在のアイテムインデックスを計算
            const currentIndex = Math.round(scrollLeft / (itemWidth + gap));

            // すべてのドットを非アクティブにして、現在のドットだけアクティブに
            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // スクロールイベントをthrottleで最適化
        const throttledUpdateIndicators = throttle(updateIndicators);
        container.addEventListener('scroll', throttledUpdateIndicators, { passive: true });

        // ドットをクリックして該当のアイテムにスクロール
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const itemWidth = items[0].offsetWidth;
                const gap = 30; // CSSのgapと同じ値
                const scrollPosition = index * (itemWidth + gap);

                container.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                });
            });
        });

        // 初期状態を設定
        updateIndicators();
    });
});
