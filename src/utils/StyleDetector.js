class StyleDetector {
    constructor(container = document.body) {
        this.container = container;
        this.defaultStyles = {
            colors: {
                primary: '#1A73E8',
                secondary: '#6C757D',
                background: '#FFFFFF',
                text: '#212529',
                border: '#DEE2E6'
            },
            typography: {
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: '16px',
                headingSize: '24px',
                fontWeight: '400',
                headingWeight: '600'
            },
            spacing: {
                padding: '16px',
                margin: '16px',
                borderRadius: '4px'
            },
            effects: {
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease-in-out'
            }
        };
    }

    detect() {
        return {
            colors: this.extractColorPalette(),
            typography: this.extractTypography(),
            spacing: this.extractSpacing(),
            effects: this.extractEffects()
        };
    }

    extractColorPalette() {
        const computedStyle = window.getComputedStyle(this.container);
        const backgroundStyle = this.findBackgroundColor(this.container);
        
        // Extract colors from the container and its children
        const colors = new Set();
        this.traverseElements(this.container, (element) => {
            const style = window.getComputedStyle(element);
            colors.add(style.color);
            colors.add(style.backgroundColor);
            colors.add(style.borderColor);
        });

        // Analyze colors to determine primary, secondary, etc.
        const colorArray = Array.from(colors).filter(color => 
            color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)'
        );

        return {
            primary: this.findMostProminent(colorArray) || this.defaultStyles.colors.primary,
            secondary: this.findSecondary(colorArray) || this.defaultStyles.colors.secondary,
            background: backgroundStyle || this.defaultStyles.colors.background,
            text: computedStyle.color || this.defaultStyles.colors.text,
            border: computedStyle.borderColor || this.defaultStyles.colors.border
        };
    }

    extractTypography() {
        const computedStyle = window.getComputedStyle(this.container);
        const headings = this.container.querySelectorAll('h1, h2, h3');
        const headingStyle = headings.length ? 
            window.getComputedStyle(headings[0]) : 
            computedStyle;

        return {
            fontFamily: computedStyle.fontFamily || this.defaultStyles.typography.fontFamily,
            fontSize: computedStyle.fontSize || this.defaultStyles.typography.fontSize,
            headingSize: headingStyle.fontSize || this.defaultStyles.typography.headingSize,
            fontWeight: computedStyle.fontWeight || this.defaultStyles.typography.fontWeight,
            headingWeight: headingStyle.fontWeight || this.defaultStyles.typography.headingWeight
        };
    }

    extractSpacing() {
        const computedStyle = window.getComputedStyle(this.container);
        const buttons = this.container.querySelectorAll('button, .btn, [class*="button"]');
        const buttonStyle = buttons.length ?
            window.getComputedStyle(buttons[0]) :
            computedStyle;

        return {
            padding: buttonStyle.padding || this.defaultStyles.spacing.padding,
            margin: computedStyle.margin || this.defaultStyles.spacing.margin,
            borderRadius: buttonStyle.borderRadius || this.defaultStyles.spacing.borderRadius
        };
    }

    extractEffects() {
        const computedStyle = window.getComputedStyle(this.container);
        const buttons = this.container.querySelectorAll('button, .btn, [class*="button"]');
        const buttonStyle = buttons.length ?
            window.getComputedStyle(buttons[0]) :
            computedStyle;

        return {
            boxShadow: buttonStyle.boxShadow || this.defaultStyles.effects.boxShadow,
            transition: buttonStyle.transition || this.defaultStyles.effects.transition
        };
    }

    // Helper methods
    findBackgroundColor(element) {
        const style = window.getComputedStyle(element);
        const backgroundColor = style.backgroundColor;
        
        if (backgroundColor === 'transparent' || backgroundColor === 'rgba(0, 0, 0, 0)') {
            return element.parentElement ? 
                this.findBackgroundColor(element.parentElement) : 
                this.defaultStyles.colors.background;
        }
        
        return backgroundColor;
    }

    findMostProminent(colors) {
        // Convert colors to RGB for analysis
        const rgbColors = colors.map(color => this.parseColor(color));
        
        // Find the color with highest saturation and non-extreme brightness
        return rgbColors.reduce((prominent, current) => {
            const [h1, s1, l1] = this.rgbToHsl(...prominent);
            const [h2, s2, l2] = this.rgbToHsl(...current);
            
            // Prefer saturated colors with moderate brightness
            return (s2 > s1 && l2 > 0.2 && l2 < 0.8) ? current : prominent;
        }, rgbColors[0]);
    }

    findSecondary(colors) {
        const primary = this.findMostProminent(colors);
        const primaryHsl = this.rgbToHsl(...primary);
        
        // Find a color that contrasts well with the primary color
        const rgbColors = colors.map(color => this.parseColor(color));
        return rgbColors.find(color => {
            const hsl = this.rgbToHsl(...color);
            const hueDiff = Math.abs(hsl[0] - primaryHsl[0]);
            return hueDiff > 60 && hueDiff < 180;
        });
    }

    traverseElements(element, callback) {
        callback(element);
        Array.from(element.children).forEach(child => 
            this.traverseElements(child, callback)
        );
    }

    parseColor(color) {
        const div = document.createElement('div');
        div.style.color = color;
        document.body.appendChild(div);
        const computed = window.getComputedStyle(div).color;
        document.body.removeChild(div);
        
        const match = computed.match(/\d+/g);
        return match ? match.map(Number) : [0, 0, 0];
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }

        return [h * 360, s, l];
    }

    // Generate CSS variables
    generateCssVariables(styles) {
        return {
            '--gateflo-primary-color': styles.colors.primary,
            '--gateflo-secondary-color': styles.colors.secondary,
            '--gateflo-background-color': styles.colors.background,
            '--gateflo-text-color': styles.colors.text,
            '--gateflo-border-color': styles.colors.border,
            '--gateflo-font-family': styles.typography.fontFamily,
            '--gateflo-font-size': styles.typography.fontSize,
            '--gateflo-heading-size': styles.typography.headingSize,
            '--gateflo-font-weight': styles.typography.fontWeight,
            '--gateflo-heading-weight': styles.typography.headingWeight,
            '--gateflo-padding': styles.spacing.padding,
            '--gateflo-margin': styles.spacing.margin,
            '--gateflo-border-radius': styles.spacing.borderRadius,
            '--gateflo-box-shadow': styles.effects.boxShadow,
            '--gateflo-transition': styles.effects.transition
        };
    }
}

export default StyleDetector;
