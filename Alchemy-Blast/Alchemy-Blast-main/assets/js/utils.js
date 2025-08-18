// Utility functions for the crafting application

// Helper function to get Greek letter for ingredients without images
function getGreekLetter(name) {
    const greekLetters = {
        'a': 'α', 'b': 'β', 'c': 'γ', 'd': 'δ', 'e': 'ε',
        'f': 'ζ', 'g': 'η', 'h': 'θ', 'i': 'ι', 'j': 'κ',
        'k': 'λ', 'l': 'μ', 'm': 'ν', 'n': 'ξ', 'o': 'ο',
        'p': 'π', 'q': 'ρ', 'r': 'σ', 's': 'τ', 't': 'υ',
        'u': 'φ', 'v': 'χ', 'w': 'ψ', 'x': 'ω', 'y': 'ς',
        'z': 'ω'
    };
    
    // Get first letter of name and return corresponding Greek letter
    const firstChar = name.charAt(0).toLowerCase();
    return greekLetters[firstChar] || firstChar;
}

// Helper function to convert color to hue rotation
function getHueRotation(color) {
    // Extract RGB from hex
    let r, g, b;
    if (color.startsWith('#')) {
        const hex = color.substring(1);
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else {
        // Default values if color parsing fails
        r = 0;
        g = 150;
        b = 255;
    }
    
    // Convert RGB to HSL and return hue
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    
    if (max === min) {
        h = 0; // achromatic
    } else {
        const d = max - min;
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
    }
    
    // Map the hue to a rotation value (210 is the base hue of our animation)
    return (h - 210) % 360;
}
