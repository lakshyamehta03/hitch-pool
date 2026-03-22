export default class Persona {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.color = this.assignColor();
        this.intents = [];
        this.createdAt = new Date();
    }

    assignColor() {
        const palette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F06292', '#AED581', '#FFD54F', '#90CAF9', '#FFAB91'];
        return palette[Math.floor(Math.random() * palette.length)];
    }
}