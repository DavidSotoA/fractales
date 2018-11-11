
class Board {

    constructor(height, width, ctx) {
        this.height     = height;
        this.width      = width;
        this.ctx        = ctx;

        this.clicks     = 0;
        this.zoomDelta  = 0.2


        this.zoom       = this.zoom.bind(this)
        this.onClick    = this.onClick.bind(this)
        this.draw       = this.draw.bind(this)
    }

    zoom(fractal) {
        let factor = 1 + this.zoomDelta
        this.ctx.scale(factor,factor);
        this.draw(fractal)
    }

    onClick(fractal) {
        this.clicks += 1;
        this.zoom(fractal);
    }

    draw(fractal) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        fractal.make()
    }

}


let FractalFactory  = {
    kotch: (profundidad, produccion, base, particion, angulo, board) => new FractalKotch(profundidad, produccion, base, particion, angulo, board)
}

class Fractal {

    constructor(profundidad, produccion, base, particion, angulo, board) {
        this.profundidad    = profundidad
        this.produccion     = produccion
        this.particion      = particion
        this.angulo         = angulo
        this.board          = board
        this.base           = base
    }

    make(){

    }
}

class Point {
    constructor(x,y) {
        this.x  = x;
        this.y  = y;
    }
}

class KothLine {

    constructor(init, angle, size) {
        this.init   = init;
        this.angle  = angle;
        let rads    = angle * Math.PI/180;
        this.end    = new Point(size*Math.cos(rads) + this.init.x, size*Math.sin(rads) + this.init.y)
    }

    make(board) {
        board.ctx.beginPath();
        board.ctx.moveTo(this.init.x, this.init.y);
        board.ctx.lineTo(this.end.x, this.end.y);
        board.ctx.stroke();
    }

}

class FractalKotch extends Fractal {

    constructor(profundidad, produccion, base, particion, angulo, board) {
        super(profundidad, produccion, base, particion, angulo, board);
    }

    makeBase(base) {
        let width,
            lines = []

        if(base == 'linea') {
            width           = this.board.width * 0.9;

            let initPoint   = new Point(this.board.width * 0.05, this.board.height*0.6),
                initLine    = new KothLine(initPoint, 0, width)

            lines.push(initLine);
        }

        else if(base == 'linea_vertical'){
            width           = this.board.height * 0.6;

            let initPoint   = new Point(this.board.width/2, this.board.height*0.8),
                initLine    = new KothLine(initPoint, 270, width)

            lines.push(initLine);
        }

        else if(base == 'triangulo') {
            width = this.board.height * 0.7;
            let a = new KothLine(new Point(this.board.width * 0.33, this.board.height*0.7), -60, width),
                b = new KothLine(a.end, 60, width),
                c = new KothLine(b.end, 180, width);

            lines.push(a);
            lines.push(b);
            lines.push(c)
        }

        else if(base == 'hexagono') {
            width = this.board.height * 0.35;
            let a = new KothLine(new Point(this.board.width * 0.45, this.board.height*0.8), 0, width),
                b = new KothLine(a.end, -60, width ),
                c = new KothLine(b.end, -120, width ),
                d = new KothLine(c.end, 180, width ),
                e = new KothLine(d.end, -240, width ),
                f = new KothLine(e.end, -300, width );

            lines.push(a);
            lines.push(b);
            lines.push(c);
            lines.push(d);
            lines.push(e);
            lines.push(f);
        }

        else if(base == 'cuadrado') {
            width = this.board.height * 0.6;
            let a = new KothLine(new Point(this.board.width * 0.33, this.board.height*0.8), 0, width),
                b = new KothLine(a.end, 270, width ),
                c = new KothLine(b.end, 180, width ),
                d = new KothLine(c.end, 90, width );

                lines.push(a);
                lines.push(b);
                lines.push(c);
                lines.push(d);
        }


        return {width: width, lines: lines}
    }

    create() {

        //iterar por profundidad
        for(let time=0; time<this.profundidad; time++) {

            let widthTime = this.originalWidth/(this.particion**(time+1)),
                newLines = [];
            //iterar por linea
            this.lines.forEach( line => {
                let initPoint    = line.init,
                    angle        = line.angle,
                    saveLine;
                //iterar por regla de producción
                for(let i=0; i<this.produccion.length; i++) {

                    let action = this.produccion[i];

                    if (action == '[') {
                        saveLine = newLines[newLines.length -1];
                    }

                    else if (action == ']') {
                        initPoint   = saveLine.end;
                        angle       = saveLine.angle;
                    }

                    else if (action == 'I') {
                        angle -= this.angulo;
                    }

                    else if (action == 'D'){
                        angle += this.angulo;
                    }

                    else if (action == 'A') {
                        let newLine = new KothLine(initPoint, angle, widthTime)

                        newLines.push(newLine);
                        initPoint = newLine.end
                    }
                }

            });

            this.lines = newLines;
        }
    }


    make() {
        this.board.ctx.lineWidth      = 1;
        this.board.ctx.strokeStyle    = "#FF0000";

        let base = this.makeBase(this.base);

        this.originalWidth  = base.width;
        this.lines          = base.lines;

        this.create()

        this.lines.forEach( line => {
            line.make(this.board)
        })
    }
}


function crearFractal() {
    let canvas          = document.getElementById("canvas"),
        ctx             = canvas.getContext("2d"),
        // tipoDeFractal   = document.getElementById("tipoDeFractal").value    || 'kotch',
        // base            = document.getElementById("base").value             || 'linea',
        profundidad     = document.getElementById("profundidad").value,
        produccion      = document.getElementById("produccion").value,
        fractal,
        board;

    const fractales = {
        curva_de_kotch: {
            tipoDeFractal:  'kotch',
            base:           'linea',
            particion:      3,
            angulo:          60,
            produccion:     'AIADDAIA'
        },

        copo_de_nieve: {
            tipoDeFractal:  'kotch',
            base:           'triangulo',
            particion:      3,
            angulo:          60,
            produccion:     'AIADDAIA'
        },

        copo_de_nieve_invertido: {
            tipoDeFractal:  'kotch',
            base:           'triangulo',
            particion:      3,
            angulo:          60,
            produccion:     'ADAIIADA'
        },

        cesaro: {
            tipoDeFractal:  'kotch',
            base:           'cuadrado',
            particion:      3,
            angulo:         60,
            produccion:     'AIADDAIA'
        },

        rama: {
            tipoDeFractal:  'kotch',
            base:           'linea_vertical',
            particion:      3,
            angulo:         27,
            produccion:     'A[IA]A[DA]A'
        },

        arbol: {
            tipoDeFractal:  'kotch',
            base:           'linea_vertical',
            particion:      2,
            angulo:         27,
            produccion:     'AA[IA][DA],'
        },

        triangulo_hielo: {
            tipoDeFractal:  'kotch',
            base:           'triangulo',
            particion:      6,
            angulo:         60,
            produccion:     'AAAIIADDDAIIADDDAIIAAA'
        },

        cuadrado_hielo: {
            tipoDeFractal:  'kotch',
            base:           'cuadrado',
            particion:      4,
            angulo:         90,
            produccion:     'AADAIIADAA'
        },

        curva_peano: {
            tipoDeFractal:  'kotch',
            base:           'linea',
            particion:      0.44721,
            angulo:         227.175,
            produccion:     'AADAIIADAA'
        }

    }

    let info = fractales[produccion];

    board   = new Board(canvas.height, canvas.width, ctx);
    fractal = FractalFactory[info.tipoDeFractal](profundidad, info.produccion, info.base, info.particion, info.angulo, board);

    board.draw(fractal);

    canvas.addEventListener('click', () => board.onClick(fractal))
}


