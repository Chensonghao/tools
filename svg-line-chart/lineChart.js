'use strict';
(function() {
    var XMLNS = 'http://www.w3.org/2000/svg';
    // 动画时间
    var animateTime = 300;
    var yTitle = '单位净值（元）';
    var r = 5;
    var fontSize = 10;
    //埋点
    var talkData = null;

    function lineChart(options) {
        if (typeof options.id !== 'string') return;
        talkData = options.talk;
        this.borderSize = 0.1;
        // 坐标点
        this.point = options.points || [];
        this.id = options.id;
        this.ele = document.getElementById(this.id);

        var eleHeight = this.ele.offsetHeight,
            eleWidth = this.ele.offsetWidth;
        // 尺寸
        if (!eleHeight || !eleWidth) return;
        this.size = {
            height: eleHeight,
            width: eleWidth
        };
        this.pointsStyle = options.pointsStyle;
        // 横纵轴信息
        this.xAxis = options.xAxis || [];
        this.yAxis = options.yAxis || [];

        var len = this.point.length;
        var xPerNum = 60;
        //x轴可用区域宽度
        var xAble = this.size.width - this.size.width * this.borderSize * 2;
        if (60 * (len - 1) > xAble) {
            // 计算x轴标注间距
            var xPerNum = xAble / (len - 1);
        }
        // 计算x轴标注的x坐标
        this.xLabelPosition = [];
        for (var i = 0; i < len; i++) {
            this.xLabelPosition.push(this.size.width * this.borderSize * 1.4 + xPerNum * i)
        }
        if (len === 1) {
            this.xLabelPosition[0] = this.size.width * this.borderSize * 1.4 + 50;
        }
        // 计算y轴标注坐标
        var yPerNum = (this.size.height - this.size.height * this.borderSize - this.size.height * this.borderSize - fontSize * 2) / (this.yAxis.count);
        this.yLabelPosition = [];
        for (var i = 0; i <= this.yAxis.count; i++) {
            this.yLabelPosition.push(this.size.height - this.size.height * this.borderSize - i * yPerNum)
        }
        // 开始计算每个点的坐标
        this.pointsPosition = [];
        var maxY = this.yLabelPosition[this.yLabelPosition.length - 1];
        var yRange = this.yLabelPosition[0] - this.yLabelPosition[this.yLabelPosition.length - 1];

        for (var i = 0; i < this.point.length; i++) {
            var a = this.yAxis.max;
            var b = this.yAxis.min;
            var c = parseFloat(this.point[i].value);
            var d = yRange;
            var L = (1 - (c - b) / (a - b)) * d;
            this.pointsPosition.push(maxY + L);
        }
        this.draw();
    }
    lineChart.prototype = {
        draw: function() {
            var _this = this;
            var id = _this.id;
            var yAxisY_top = this.yLabelPosition[this.yLabelPosition.length - 1];
            var yAxisY_bottom = this.size.height - this.size.height * this.borderSize;
            var yAxisX_top = this.size.width * this.borderSize;
            var yAxisX_bottom = this.size.width * this.borderSize;
            var yAxisEndX = this.size.width; //this.xLabelPosition[this.xLabelPosition.length - 1];
            var xAxisY_left = this.size.height - this.size.height * this.borderSize;
            var xAxisY_right = this.size.height - this.size.height * this.borderSize;
            var xAxisX_left = this.size.width * this.borderSize;
            var xAxisX_rgiht = yAxisEndX; //this.size.width - this.size.width * this.borderSize;
            //yAxisEndX
            var mainSvg = makeSVG('svg', {
                height: this.size.height,
                width: this.size.width,
                version: '1.1',
                xmlns: XMLNS
            });
            var axisGroup = makeSVG('g', {});
            var xLine = makeSVG('line', {
                x1: xAxisX_left,
                x2: xAxisX_rgiht,
                y1: xAxisY_left,
                y2: xAxisY_right
            });
            xLine.setAttribute('stroke', '#f3f3f3');
            xLine.setAttribute('stroke-width', 1);
            xLine.setAttribute('stroke-dasharray', 2);

            var yLine_start = makeSVG('line', {
                x1: yAxisX_top,
                x2: yAxisX_bottom,
                y1: yAxisY_top,
                y2: yAxisY_bottom
            });

            yLine_start.setAttribute('stroke', '#f3f3f3');
            yLine_start.setAttribute('stroke-width', 1);
            yLine_start.setAttribute('stroke-dasharray', 2);

            var yLine_end = makeSVG('line', {
                x1: yAxisEndX,
                x2: yAxisEndX,
                y1: yAxisY_top,
                y2: yAxisY_bottom
            });
            yLine_end.setAttribute('stroke', '#f3f3f3');
            yLine_end.setAttribute('stroke-width', 1);
            yLine_end.setAttribute('stroke-dasharray', 2);

            axisGroup.appendChild(xLine);
            axisGroup.appendChild(yLine_start);
            axisGroup.appendChild(yLine_end);

            // 渲染x轴label
            var xLabelTpl = '';
            for (var i = 0; i < this.xLabelPosition.length; i++) {
                var temp = makeSVG('text', {
                    x: this.xLabelPosition[i],
                    y: xAxisY_right + fontSize + 3,
                    fill: '#a8a8a8'
                });
                //避免使用innerHTML不兼容ios8
                temp.textContent = this.xAxis.labels[i];
                temp.setAttribute('font-size', fontSize);
                temp.setAttribute('text-anchor', 'middle');
                axisGroup.appendChild(temp);
            }

            // 渲染y轴label
            var yLabelTpl = '';
            var yPerNum = (this.yAxis.max - this.yAxis.min) / this.yAxis.count;
            for (var i = 1; i <= this.yAxis.count; i++) {
                var temp = makeSVG('text', {
                    x: yAxisX_top - 30,
                    y: this.yLabelPosition[i] + 4,
                    fill: '#a8a8a8'
                });
                //避免使用innerHTML不兼容ios8
                temp.textContent = Number(this.yAxis.min + i * yPerNum).toFixed(3);
                temp.setAttribute('font-size', fontSize);
                temp.setAttribute('text-anchor', 'start');
                axisGroup.appendChild(temp);
            }
            var temp = makeSVG('text', {
                x: yAxisX_top - 30,
                y: this.yLabelPosition[this.yAxis.count] - 20,
                fill: '#666'
            });
            //避免使用innerHTML不兼容ios8
            temp.textContent = yTitle;
            temp.setAttribute('font-size', 11);
            temp.setAttribute('text-anchor', 'start');
            axisGroup.appendChild(temp);

            // 渲染坐标轴网格线
            for (var i = 1; i < this.yLabelPosition.length; i++) {
                var tempLine = makeSVG('line', {
                    x1: xAxisX_rgiht,
                    y1: this.yLabelPosition[i],
                    x2: xAxisX_left,
                    y2: this.yLabelPosition[i],
                    stroke: '#f3f3f3'
                });
                tempLine.setAttribute('stroke-width', 1);
                tempLine.setAttribute('stroke-dasharray', 2);
                mainSvg.appendChild(tempLine);
            }

            //渲染path
            var circleArray = [];
            var pathsDArray = [];
            var pathsArray = [];
            var pathG = makeSVG('g', {});
            var sTime = animateTime / (this.pointsPosition.length - 1);
            var labels = [];
            for (var i = 0; i < this.pointsPosition.length; i++) {
                labels.push(this.point[i].value);
                if (i > 0) {
                    pathsDArray.push('M' + this.xLabelPosition[i - 1] +
                        ',' + this.pointsPosition[i - 1] +
                        ' L' + this.xLabelPosition[i] +
                        ',' + this.pointsPosition[i]);

                    var temp = makeSVG('path', {
                        d: pathsDArray[i - 1],
                        stroke: '#d8ad5c'
                    });
                    temp.setAttribute('fill', 'none');
                    temp.setAttribute('stroke-width', '1');
                    var pathLength = temp.getTotalLength();
                    temp.style.strokeDasharray = pathLength;
                    temp.style.strokeDashoffset = pathLength;
                    temp.style.transition = 'all ' + sTime + 'ms linear';

                    pathG.appendChild(temp);

                    (function(temp, i) {
                        setTimeout(function() {
                            temp.style.strokeDashoffset = '0';
                        }, sTime * i);
                    })(temp, i);
                }

                circleArray.push({
                    x: this.xLabelPosition[i],
                    y: this.pointsPosition[i]
                });
            }
            mainSvg.appendChild(axisGroup);
            mainSvg.appendChild(pathG);
            //渲染svg
            document.getElementById(id).appendChild(mainSvg);

            this.point && this.point.length>0 && this.initLine({
                data: circleArray,
                container: mainSvg,
                text: labels,
                stroke: _this.pointsStyle.stroke,
                strokeWidth: _this.pointsStyle.strokeWidth
            });
        },
        initLine: function(params) {
            var data = params.data;
            var container = params.container;
            var text = params.text;
            var stroke = params.stroke;

            var circles = [];
            for (var i = 0; i < data.length; i++) {
                var circle1 = makeSVG('circle', {
                    cx: data[i].x,
                    cy: data[i].y,
                    r: r,
                    stroke: stroke,
                    'stroke-width': 1,
                    fill: '#fff',
                    class: 'normalNode'
                });

                var circle2 = makeSVG('circle', {
                    cx: data[i].x,
                    cy: data[i].y,
                    r: r - 1,
                    'stroke-width': 2,
                    fill: '#fff',
                    stroke: stroke, //'#ffe7ba',
                    class: 'activeNode'
                });
                var circle3 = makeSVG('circle', {
                    cx: data[i].x,
                    cy: data[i].y,
                    r: r + 3,
                    'stroke-width': 2,
                    fill: 'rgb(228,184,101)',
                    stroke: '#ffe7ba',
                    class: 'activeNode'
                });
                //透明大圆，增大点击区域
                var circle4 = makeSVG('circle', {
                    cx: data[i].x,
                    cy: data[i].y,
                    r: r + 10,
                    fill: 'transparent',
                });

                var g = makeSVG('g', {});

                g.appendChild(circle4);
                g.appendChild(circle1);
                g.appendChild(circle3);
                g.appendChild(circle2);

                var heightTimes = 1.2; // 宽度倍数
                var widthTimes = 2.5; // 高度倍数
                //节点文本
                var tempLabel = makeSVG('text', {
                    x: data[i].x,
                    y: data[i].y - fontSize - fontSize * ((widthTimes - 1) / 2) - 3,
                    fill: '#ffffff',
                    class: 'activeNode'
                });
                var arrowBottomX = data[i].x;
                var arrowBottomY = data[i].y - 10;
                var borderRaduis = 4; // 圆角半径

                var pathDinfo = 'M ' + arrowBottomX + ',' + arrowBottomY + // a
                    ' L' + (arrowBottomX - 4) + ',' + (arrowBottomY - 4) + // b
                    ' L' + (arrowBottomX - 4 - heightTimes * fontSize) + ',' + (arrowBottomY - 4) + // c
                    ' A' + borderRaduis + ' ' + borderRaduis + ' 0 0 1 ' + (arrowBottomX - 4 - heightTimes * fontSize - borderRaduis) + ',' + (arrowBottomY - 4 - borderRaduis) +
                    ' L' + (arrowBottomX - 4 - heightTimes * fontSize - borderRaduis) + ',' + (arrowBottomY - widthTimes * fontSize + borderRaduis) + // d
                    ' A' + borderRaduis + ' ' + borderRaduis + ' 0 0 1 ' + (arrowBottomX - 4 - heightTimes * fontSize) + ',' + (arrowBottomY - widthTimes * fontSize) + // d dd
                    ' L' + (arrowBottomX + 4 + heightTimes * fontSize) + ',' + (arrowBottomY - widthTimes * fontSize) + // e
                    ' A' + borderRaduis + ' ' + borderRaduis + ' 0 0 1 ' + (arrowBottomX + 4 + heightTimes * fontSize + borderRaduis) + ',' + (arrowBottomY - widthTimes * fontSize + borderRaduis) + // e e
                    ' L' + (arrowBottomX + 4 + heightTimes * fontSize + borderRaduis) + ',' + (arrowBottomY - 4 - borderRaduis) + // f
                    ' A' + borderRaduis + ' ' + borderRaduis + ' 0 0 1 ' + (arrowBottomX + 4 + heightTimes * fontSize) + ',' + (arrowBottomY - 4) + // f  ff
                    ' L' + (arrowBottomX + 4) + ',' + (arrowBottomY - 4); // g
                var tempPath = makeSVG('path', {
                    d: pathDinfo,
                    fill: '#d8ad5c',
                    class: 'activeNode'
                });
                //避免使用innerHTML不兼容ios8
                tempLabel.textContent = text[i];
                tempLabel.setAttribute('font-size', fontSize);
                tempLabel.setAttribute('text-anchor', 'middle');

                g.appendChild(tempPath);
                g.appendChild(tempLabel);
                // 最后一个点默认选中
                if (i == data.length - 1) {
                    circle1.style.display = 'none';
                } else {
                    circle2.style.display = 'none';
                    circle3.style.display = 'none';
                    tempPath.style.display = 'none';
                    tempLabel.style.display = 'none';
                }
                (function(i) {
                    tap(g, function(e) {
                        //埋点
                        talkData && talkData('年金资产_组合详情页面', '净值曲线节点');
                        [].forEach.call(document.querySelectorAll('svg .activeNode'), function(e) {
                            e.style.display = 'none';
                        });
                        [].forEach.call(document.querySelectorAll('svg .normalNode'), function(e) {
                            e.style.display = 'block';
                        });
                        var currentTagName = e.target.tagName;
                        var g = currentTagName === 'g' ? e.target : e.target.parentNode;
                        var children = g.childNodes;
                        children[1].style.display = 'none';
                        children[2].style.display = 'block';
                        children[3].style.display = 'block';
                        children[4].style.display = 'block';
                        children[5].style.display = 'block';
                    }, false);
                })(i);
                circles.push(g);
            }
            this.drawLineAnimation(container, circles);
        },
        drawLineAnimation: function(container, circles) {
            var i = 0;
            var length = circles.length - 1;
            var sTime = animateTime / length;
            var timer = setInterval(function() {
                if (i >= length) {
                    clearInterval(timer);
                }
                container.appendChild(circles[i]);
                i++;
            }, sTime);
        }
    }

    //创建dom节点
    function makeSVG(tag, attributes) {
        var elem = document.createElementNS(XMLNS, tag);
        for (var name in attributes) {
            elem.setAttribute(name, attributes[name]);
        }
        return elem;
    }

    //自定义tap时间
    function tap(el, func) {
        var startX = 0,
            startY = 0,
            offsetX = 0,
            offsetY = 0;
        var touchstart = function(evt) {
            offsetX = 0;
            offsetY = 0;
            //开始按下的x坐标
            startX = evt.touches[0].pageX;
            startY = evt.touches[0].pageY;
        };
        var touchmove = function(evt) {
            //计算手指一动偏移量
            offsetX = evt.targetTouches[0].pageX - startX;
            offsetY = evt.targetTouches[0].pageY - startY;
            //阻止浏览器默认行为
            evt.preventDefault();
        };
        var touchend = function(evt) {
            if (Math.abs(offsetX) < 30 && Math.abs(offsetY) < 30 && !el.getAttribute('disabled')) {
                func(evt);
            }
            evt.preventDefault();
        };
        el.addEventListener('touchstart', touchstart);
        el.addEventListener('touchmove', touchmove);
        el.addEventListener('touchend', touchend);
    }
    module.exports = lineChart;
})();
