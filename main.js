
class Board {

    constructor(height, width, ctx) {
        this.height     = height;
        this.width      = width;
        this.ctx        = ctx;

        this.clicks     = 0;
        this.zoomDelta  = 0.2

        this.onClick    = this.zoom.bind(this)
        this.draw       = this.draw.bind(this)
    }



    zoom(event, fractal) {
        let point = new Point(event.clientX, event.clientY)

        this.clicks += 1;
        fractal.zoom(this.zoomDelta, point);
        this.draw(fractal)
    }

    draw(fractal) {
        this.ctx.clearRect(0, 0, this.width, this.height);

        fractal.make()
    }

}


let FractalFactory  = {
    kotch:      (profundidad, info, board) => new FractalKotch(profundidad, info, board),
    sierpinsky: (profundidad, info, board) => new FractalSierpinsky(profundidad, info, board),
    mandelbrot: (profundidad, info, board) => new FractalMandelbrot(profundidad, info, board),
}

class Fractal {

    constructor(profundidad, info, board) {
        this.profundidad    = profundidad
        this.info           = info
        this.board          = board
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

    constructor(profundidad, info, board) {
        super(profundidad, info, board);

        this.particion      = this.info.particion
        this.produccion     = this.info.produccion
        this.angulo         = this.info.angulo
        this.base           = this.info.base
        this.initProd       = this.info.initProd

        let base = this.makeBase(this.base);

        this.originalWidth  = base.width;
        this.lines          = base.lines;

        this.create()
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
            let a = new KothLine(new Point(this.board.width/2, this.board.height*0.8), 330, width),
                b = new KothLine(a.end, 270, width ),
                c = new KothLine(b.end, 210, width ),
                d = new KothLine(c.end, 150, width ),
                e = new KothLine(d.end, 90, width ),
                f = new KothLine(e.end, 30, width );

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

    expandProduction() {
        let x = this.initProd;
        for(let time=1; time<=this.profundidad; time++) { 
            if (time == 1) {
                x = x.replace("A", this.produccion);
            }
            else {
                x = x.replace(new RegExp("A", 'g'), x);
            }
        }

        return x;
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

        this.lines.forEach( line => {
            line.make(this.board)
        })
    }
}


class Triangle {

    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }

    make(board) {
        board.ctx.beginPath();
        board.ctx.moveTo(this.a.x, this.a.y);
        board.ctx.lineTo(this.b.x, this.b.y);
        board.ctx.lineTo(this.c.x, this.c.y);
        board.ctx.fill();
    }

    split() {

        let size = Math.sqrt( Math.abs(this.a.x - this.b.x)**2 + Math.abs(this.a.y - this.b.y)**2 )

        let rad = 300 * Math.PI/180;
        let ab  = new Point( (size/2)*Math.cos(rad) + this.a.x,  (size/2)*Math.sin(rad) + this.a.y);

        rad     = 60 * Math.PI/180;
        let bc  = new Point( (size/2)*Math.cos(rad) + this.b.x,  (size/2)*Math.sin(rad) + this.b.y)

        rad     = 180 * Math.PI/180;
        let ac  = new Point( (size/2)*Math.cos(rad) + this.c.x,  (size/2)*Math.sin(rad) + this.c.y)

        return [
            new Triangle(new Point(this.a.x, this.a.y), ab, ac),
            new Triangle(ab, new Point(this.b.x, this.b.y), bc),
            new Triangle(ac, bc, new Point(this.c.x, this.c.y))
        ]
        
    }
}

class Square {

    constructor(b, width) {
        this.b = b;
        this.size = width

    }

    make(board) {
        board.ctx.fillRect(this.b.x, this.b.y, this.size, this.size);
    }

    split() {
        let split = this.size/3,
            newSquares = []
        
        for (let i = 0; i<3; i++) {
            for (let j = 0; j<3; j++) {
                if (i != 1 || j !=1 ) { 
                    newSquares.push(new Square(new Point(this.b.x + split*j, this.b.y + split*i), split));
                }

            }
        }

        return newSquares;
    }
}


class FractalSierpinsky extends Fractal {

    constructor(profundidad, info, board) {
        super(profundidad, info, board);

        this.shapes = []

        this.makeBase(this.info.base);
        this.create();

    }

    create() {
        
        let list = this.shapes;
        for(let i=0; i<this.profundidad; i++) {

            let newList = [];
            list.forEach( shape => {

                shape.split().forEach( x => {
                    newList.push(x)
                })

            })
            list = newList;

        }

        this.shapes = list;
    }

    makeBase(base) {
        if (base == 'triangulo') {
            let width = this.board.height*0.8
            let a = new Point(this.board.width/2 - width/2, this.board.height*0.8),
                b = new Point(this.board.width/2, this.board.height*0.8 - width*(Math.sqrt(3)/2)),
                c = new Point(this.board.width/2 + width/2, this.board.height*0.8)

            this.shapes.push(new Triangle(a, b, c));
        }

        else if(base == 'cuadrado') {
            let width = this.board.height*0.6;

            let a = new Point(this.board.width/2 - width/2, this.board.height/2 + width/2),
                b = new Point(this.board.width/2 - width/2, this.board.height/2 - width/2),
                c = new Point(this.board.width/2 + width/2, this.board.height/2 - width),
                d = new Point(this.board.width/2 + width/2, this.board.height/2 + width/2)

                this.shapes.push(new Square(b, width))
        }
    }

    make() {
        this.board.ctx.fillStyle    = "#FF0000";

        this.shapes.forEach( shape => {
            shape.make(this.board);
        })
    }

}

class Imaginary {

    constructor(real, imaginary) {
        this.real       = real;
        this.imaginary  = imaginary;
    }

    static product(a, b) {
        return new Imaginary(a.real * b.real - a.imaginary * b.imaginary, a.real * b.imaginary + a.imaginary * b.real);
    }

    static add(a, b) {
        return new Imaginary(a.real + b.real, a.imaginary + b.imaginary);
    }
}

class FractalMandelbrot extends Fractal {

    constructor(profundidad, info, board) {
        super(profundidad, info, board);

        this.colorDelta = 100/this.info.iterate;
    }

    create() {
        let screensize  = this.calculateScreenSize(this.board.width, this.board.height, this.info.xRange, this.info.yRange);

        this.width      = screensize.width
        this.height     = screensize.height
        this.cutW       = screensize.cutW
        this.cutH       = screensize.cutH

        this.center     = new Point(this.width/2, this.height/2)
        this.delta      = this.calculateDeltaSize(this.width, this.height, this.info.xRange, this.info.yRange);

        let z1 = this.width/Math.abs(this.info.xRange.a - this.info.xRange.b),
            z2 = this.height/Math.abs(this.info.yRange.a - this.info.yRange.b)

        for (let i = z2*this.info.yRange.a; i <= z2*this.info.yRange.b; i ++) {
            for(let j = z1*this.info.xRange.a; j <= z1*this.info.xRange.b; j ++) {

                let x =  this.screenToCartesian(j, this.delta.width, this.width  ),
                    y = -this.screenToCartesian(i, this.delta.height, this.height);

                let c = new Imaginary(x, y);

                let point = this.mandelbrotFunction(c, this.info.iterate, this.info.puntoEscape)

                if ( x == this.info.xRange.b || x == this.info.xRange.a || y ==  this.info.yRange.a || y ==  this.info.yRange.b ) {
                    this.board.ctx.fillStyle    = `rgb(255, 0, 0)`;
                } else {
                    
                    if (point.isMandelbrot){
                        this.board.ctx.fillStyle    = "#000000";
                    } else {
                        this.board.ctx.fillStyle    = `hsl(256, 100%, ${point.puntoEscape*3}%)`;
                    }
                }

                this.board.ctx.fillRect( j + Math.abs(z1*this.info.xRange.a) , i + Math.abs(z2*this.info.yRange.a), 1, 1 );

            }
        }
    }

    zoom(delta, point) {
        let width = Math.abs(this.info.xRange.a - this.info.xRange.b),
            height = Math.abs(this.info.yRange.a - this.info.yRange.b)

        let move = new Point ( this.screenToCartesian(point.x - this.board.width/2, this.delta.width, this.width ),
        this.screenToCartesian(point.y - this.board.height/2, this.delta.height, this.height))

        this.info.xRange.a += move.x*(delta/0.4)
        this.info.xRange.b += move.x*(delta/0.4)
        this.info.yRange.a += move.y*(delta/0.4)
        this.info.yRange.b += move.y*(delta/0.4)

        this.info.xRange.a += width*(delta/2)
        this.info.xRange.b -= width*(delta/2)
        this.info.yRange.a += height*(delta/2)
        this.info.yRange.b -= height*(delta/2)

    }

    mandelbrotFunction(c, iterate, puntoEscape) {
        let z = c
 
        for (let i = 1; i < iterate; i++) {

            if (Math.sqrt( z.real**2 + z.imaginary**2 ) > puntoEscape) {

                return {
                    puntoEscape: i,
                    isMandelbrot: false
                }

            }

            z = Imaginary.add( Imaginary.product(z, z), c );
        }

        return {
            isMandelbrot: true
        }
    }

    make() {
        this.create();
    }

    calculateScreenSize(width, height, xRange, yRange) {
        let cartesianWidth  = Math.abs(xRange.a - xRange.b),
            cartesianHeight = Math.abs(yRange.a - yRange.b);

        let x =  Math.min(width/cartesianWidth, height/cartesianHeight)

        return {
            width:  cartesianWidth*x,
            height: cartesianHeight*x,

            cutW:   width - cartesianWidth*x,
            cutH:   height - cartesianHeight*x
        }
    }

    calculateDeltaSize(width, height, xRange, yRange) {
        let pixelWidth  = Math.abs(xRange.a - xRange.b)/width, 
            pixelHeight = Math.abs(yRange.a - yRange.b)/height

        return {
            width:  pixelWidth,
            height: pixelHeight
        }
    }

    cartesianToScreen(cartesianPos, pixelSize, size) {
        return (cartesianPos/pixelSize) + (size/2)
    }

    screenToCartesian(pixelPos, pixelSize, size) {
        return pixelSize*(pixelPos);
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
            angulo:         60,
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
        },

        isla_gosper: {
            tipoDeFractal:  'kotch',
            base:           'hexagono',
            particion:      3,
            angulo:         60,
            produccion:     'ADAIA'
        },

        triangulo_sierpinsky: {
            tipoDeFractal:  'sierpinsky',
            base:           'triangulo',
        },

        alfombra_sierpinsky: {
            tipoDeFractal: 'sierpinsky',
            base:           'cuadrado'
        },

        mandelbrot: {
            tipoDeFractal: 'mandelbrot',
            xRange: {a: -2, b: 1},
            yRange: {a: -1, b: 1},
            iterate: 1000,
            puntoEscape: 2
        }

    }

    let info = fractales[produccion];

    board   = new Board(canvas.height, canvas.width, ctx);
    fractal = FractalFactory[info.tipoDeFractal](profundidad, info, board);

    board.draw(fractal);

    canvas.addEventListener('click', (event) => board.zoom(event, fractal))
}


