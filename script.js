// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const menuIcon = document.querySelector('#menu-icon');
    const navbar = document.querySelector('.navbar');

    if (menuIcon && navbar) {
        menuIcon.onclick = () => {
            menuIcon.classList.toggle('bx-x');
            navbar.classList.toggle('active');
        };
    }

    // --- Active Link Highlighting & Sticky Header on Scroll ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('header nav a');
    const header = document.querySelector('.header');

    window.onscroll = () => {
        // Active link highlighting
        sections.forEach(sec => {
            let top = window.scrollY;
            let offset = sec.offsetTop - 150;
            let height = sec.offsetHeight;
            let id = sec.getAttribute('id');

            if (top >= offset && top < offset + height) {
                navLinks.forEach(links => {
                    links.classList.remove('active');
                    let activeLink = document.querySelector('header nav a[href*=' + id + ']');
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                });
            }
        });

        // Sticky Header
        if (header) {
            header.classList.toggle('sticky', window.scrollY > 100);
        }

        // Close mobile menu on scroll
        if (menuIcon && navbar) {
            menuIcon.classList.remove('bx-x');
            navbar.classList.remove('active');
        }
    };

    // --- Theme Switcher Logic ---
    const themeSwitch = document.getElementById('theme-switch-checkbox');

    // Function to apply the theme
    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            if(themeSwitch) themeSwitch.checked = true;
        } else {
            document.body.classList.remove('light-mode');
            if(themeSwitch) themeSwitch.checked = false;
        }
        // Update canvas particles color immediately
        if (window.updateParticleColor) {
           window.updateParticleColor();
        }
    };

    // Event listener for the toggle
    if (themeSwitch) {
        themeSwitch.addEventListener('change', () => {
            if (themeSwitch.checked) {
                localStorage.setItem('theme', 'light');
                applyTheme('light');
            } else {
                localStorage.setItem('theme', 'dark');
                applyTheme('dark');
            }
        });
    }

    // On page load, check for saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
    applyTheme(savedTheme);


    // --- Animated Background Canvas Script ---
    let canvas, ctx, w, h;
    let units, pointer;
    let particleColorRGB;

    // Configuration for the canvas elements
    let area = {
        distance: 20,
        padding: 15 // Reduced padding for smaller margins
    };

    function init() {
        canvas = document.querySelector("#canvas");
        if (!canvas) return; // Exit if canvas not found
        ctx = canvas.getContext("2d");

        resizeReset();
        animationLoop();
    }

    function mousemove(e) {
        if(pointer) {
            pointer.x = e.clientX; // Use clientX for viewport-relative coordinates
            pointer.y = e.clientY; // Use clientY for viewport-relative coordinates
        }
    }

    function resizeReset() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;

        area.cols = Math.floor((w - area.padding * 2) / area.distance);
        area.rows = Math.floor((h - area.padding * 2) / area.distance);

        pointer = {
            x: w / 2,
            y: h / 2
        };
        
        updateParticleColor(); // Set initial particle color
        
        units = [];
        for (let i = 0; i < area.rows; i++) {
            for (let j = 0; j < area.cols; j++) {
                units.push(new Unit(j, i));
            }
        }
    }

    function animationLoop() {
        ctx.clearRect(0, 0, w, h);
        drawScene();
        requestAnimationFrame(animationLoop);
    }

    function drawScene() {
        if (units) {
            units.forEach((unit) => {
                unit.update();
                unit.draw();
            });
        }
    }
    
    // Function to get the current particle color from CSS variables
    window.updateParticleColor = function() {
        const computedStyle = getComputedStyle(document.body);
        particleColorRGB = computedStyle.getPropertyValue('--particle-color-rgb').trim();
    }

    class Unit {
        constructor(col, row) {
            this.x = area.distance * (col + 0.5) + area.padding;
            this.y = area.distance * (row + 0.5) + area.padding;
            this.w = 18;
            this.h = 3;
            this.angle = 0;
            this.scale = 1;
            this.alpha = 0.1;
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.scale(this.scale, this.scale);
            // Use the dynamically updated color
            ctx.fillStyle = `rgba(${particleColorRGB || '255, 205, 255'}, ${this.alpha})`;
            ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
            ctx.restore();
        }
        update() {
            this.angle = Math.atan2(pointer.y - this.y, pointer.x - this.x);
            this.distance = Math.sqrt(Math.pow(this.x - pointer.x, 2) + Math.pow(this.y - pointer.y, 2));
            const maxDist = Math.sqrt(Math.pow(w / 2, 2) + Math.pow(h / 2, 2));
            this.alpha = Math.max(0.1, 1 - this.distance / (maxDist * 0.7));
            this.scale = Math.max(0.4, 1 - this.distance / (maxDist * 0.8));
        }
    }

    // --- Event Listeners ---
    init(); // Initialize canvas script
    window.addEventListener("resize", resizeReset);
    window.addEventListener("mousemove", mousemove);
});

