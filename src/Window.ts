type WindowType = "Client" | "Stage" | "Controls";

export default class Window {
    title: String;
    type: WindowType;
    position: {
        x: number,
        y: number
    };
    size:{
        width:number,
        height:number
    }
    opened: true;

    constructor(title = "") {

    }

    setPosition(x: number, y: number){
        this.position = {x,y};
    }

    setSize(width: number, height: number){
        this.size = {width, height}
    }
}