export default class Visualizer {
    public static keyColor(keyIndex) {
        let r = 0;
        let g = 0;
        let b = 0;

        const div = keyIndex % 20;
        if (keyIndex < 20) {
            // RED
            // Use Math.max to start at 25% red instead of black
            r = Math.max(0.25, div / 20) * 255;
        } else if (keyIndex < 40) {
            // YELLOW
            r = 255;
            g = (div / 40) * 255;
        } else if (keyIndex < 60) {
            // GREEN
            r = 255 - (div / 20) * 255;
            g = 255;
        } else if (keyIndex < 80) {
            // CYAN
            g = 255 - (div / 20) * 255;
            b = (div / 20) * 255;
        } else if (keyIndex < 100) {
            // BLUE
            b = (keyIndex / 100) * 255;
        } else if (keyIndex <= 120) {
            // PURPLE
            // Change the division to 40 instead of 20 so we don't fade all the way to red
            // This way the last note is still a shade of purple
            b = 255 - (div / 40) * 255;
            r = (div / 40) * 255;
        }
        return (
            "#" +
            parseInt(r).toString(16).padStart(2, "0") +
            parseInt(g).toString(16).padStart(2, "0") +
            parseInt(b).toString(16).padStart(2, "0")
        );
    }
}
