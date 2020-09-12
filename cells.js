'use strict'

class CellField {
    constructor (width, height) {
        this.width = width
        this.height = height
        this.iMax = this.width - 1
        this.jMax = this.height - 1

        this.cells = new Array(this.width)
        
        for(let i = 0; i < this.width; i++) {
            this.cells[i] = new Array(this.height)
            for(let j = 0; j < this.height; j++) {
                this.cells[i][j] = 0b0000
            }
        }
        this.context = null
        this.palette = null
        this.bgColor = ''
    }
    setContext(canvas) {
        this.context = canvas.getContext('2d')
        return this
    }
    setPalette(colors) {
        this.palette = colors.slice()
        return this
    }
    setBGColor(bgColor) {
        this.bgColor = bgColor
        this.context.fillStyle = this.bgColor
        return this
    }
    // заполнить пространство с заданной плотностью с помощью встроенного ГСЧ
    seed(density) {
        const sparcity = 1 - density
        
        for(let i = 0; i < this.width; i++) {
            for(let j = 0; j < this.height; j++) {
                this.cells[i][j] = Math.random() > sparcity ? 0b0001 : 0b0000
            }
        }

        return this
    }
    // один шаг (правило MirekGro)
    step() {
        let i0, i1, j0, j1

        for(let i = 0; i < this.width; i++) {
            switch (i) {
                case 0: i0 = this.iMax; i1 = i + 1; break;
                case this.iMax: i0 = i - 1; i1 = 0; break;
                default: i0 = i - 1; i1 = i + 1; 
            }

            let currentCellState = this.cells[i][0] & 0b0011
            // количество клеток в состоянии 1 вокруг элемента i:0
            let summ = ((this.cells[i0][j0] & 0b0011) === 0b0001 ? 1 : 0) + 
                ((this.cells[i][j0] & 0b0011) === 0b0001 ? 1 : 0) + 
                ((this.cells[i1][j0] & 0b0011) === 0b0001 ? 1 : 0) +

                ((this.cells[i0][0] & 0b0011) === 0b0001 ? 1 : 0) +
                (currentCellState === 0b0001 ? 1 : 0) +
                ((this.cells[i1][0] & 0b0011) === 0b0001 ? 1 : 0) +

                ((this.cells[i0][1] & 0b0011) === 0b0001 ? 1 : 0) +
                ((this.cells[i][1] & 0b0011) === 0b0001 ? 1 : 0) +
                ((this.cells[i1][1] & 0b0011) === 0b0001 ? 1 : 0)

            // определяем состояние в следующий момент времени для элемента i:0
            switch (currentCellState) {
                case 0: this.cells[i][0] = summ === 2 ? 0b0100 : 0b0000; break;
                case 1: this.cells[i][0] = this.cells[i][0] = (summ > 3 && summ < 7) ? 0b0101 : 0b1001; break;
                case 2: this.cells[i][0] = 0b1110; break;
                default: this.cells[i][0] = 0b0011;
            }
            // количество клеток в состоянии 1 вокруг элемента i:1
            summ = summ - ((this.cells[i0][j0] & 0b0011) === 0b0001 ? 1 : 0) - 
                ((this.cells[i][j0] & 0b0011) === 0b0001 ? 1 : 0) - 
                ((this.cells[i1][j0] & 0b0011) === 0b0001 ? 1 : 0) +
                
                ((this.cells[i0][2] & 0b0011) === 0b0001 ? 1 : 0) +
                ((this.cells[i][2] & 0b0011) === 0b0001 ? 1 : 0) +
                ((this.cells[i1][2] & 0b0011) === 0b0001 ? 1 : 0)

            // определяем состояние в следующий момент времени для элемента i:1
            currentCellState = this.cells[i][1] & 0b0011

            switch (currentCellState) {
                case 0: this.cells[i][1] = summ === 2 ? 0b0100 : 0b0000; break;
                case 1: this.cells[i][1] = (summ > 3 && summ < 7) ? 0b0101 : 0b1001; break;
                case 2: this.cells[i][1] = 0b1110; break;
                default: this.cells[i][1] = 0b0011;
            }
            
            // количество клеток в состоянии 1 вокруг элемента i:2 - i:jMax - 1
            for(let j = 2; j < this.jMax; j++) {
                j0 = j - 2
                j1 = j + 1

                summ = summ - ((this.cells[i0][j0] & 0b0011) === 0b0001 ? 1 : 0) - 
                ((this.cells[i][j0] & 0b0011) === 0b0001 ? 1 : 0) - 
                ((this.cells[i1][j0] & 0b0011) === 0b0001 ? 1 : 0) +
                
                ((this.cells[i0][j1] & 0b0011) === 0b0001 ? 1 : 0) +
                ((this.cells[i][j1] & 0b0011) === 0b0001 ? 1 : 0) +
                ((this.cells[i1][j1] & 0b0011) === 0b0001 ? 1 : 0)
                // определяем состояние в следующий момент времени для элемента в дипазоне i:2 - i:jMax - 1
                currentCellState = this.cells[i][j] & 0b0011

                switch (currentCellState) {
                    case 0: this.cells[i][j] = summ === 2 ? 0b0100 : 0b0000; break;
                    case 1: this.cells[i][j] = (summ > 3 && summ < 7) ? 0b0101 : 0b1001; break;
                    case 2: this.cells[i][j] = 0b1110; break;
                    default: this.cells[i][j] = 0b0011;
                }
            }
            // количество клеток в состоянии 1 вокруг элемента i:jMax
            j0 = this.jMax - 2

            summ = summ - ((this.cells[i0][j0] & 0b0011) === 0b0001 ? 1 : 0) - 
            ((this.cells[i][j0] & 0b0011) === 0b0001 ? 1 : 0) - 
            ((this.cells[i1][j0] & 0b0011) === 0b0001 ? 1 : 0) +
            
            ((this.cells[i0][0] & 0b0011) === 0b0001 ? 1 : 0) +
            ((this.cells[i][0] & 0b0011) === 0b0001 ? 1 : 0) +
            ((this.cells[i1][0] & 0b0011) === 0b0001 ? 1 : 0)
            // определяем состояние в следующий момент времени для элемента в дипазоне i:2 - i:jMax - 1
            currentCellState = this.cells[i][this.jMax] & 0b0011
            switch (currentCellState) {
                case 0: this.cells[i][this.jMax] = summ === 2 ? 0b0100 : 0b0000; break;
                case 1: this.cells[i][this.jMax] = (summ > 3 && summ < 7) ? 0b0101 : 0b1001; break;
                case 2: this.cells[i][this.jMax] = 0b1110; break;
                default: this.cells[i][this.jMax] = 0b0011;
            }
        }
    }
    // перевести следующее состояние к настоящему
    /*update() {
        for(let i = 0; i < this.width; i++) {
            for(let j = 0; j < this.height; j++) {
                this.cells[i][j] = this.cells[i][j] >> 2
            }
        }
    }*/
    // визуализировать
    visualize() {
        this.context.fillStyle = '#000'
        this.context.fillRect(0, 0, this.width, this.height)
        
        for(let i = 0; i < this.width; i++) {
            for(let j = 0; j < this.height; j++) {
                if(this.cells[i][j]) {
                    this.cells[i][j] >>= 2
                    const i0 = this.cells[i][j]
                    if(i0) {
                        this.context.fillStyle = this.palette[i0]
                        this.context.fillRect(i, j, 1, 1)      
                    }
                }
            }
        }
    }
}