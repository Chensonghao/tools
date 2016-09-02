'use strict';
(function() {
    /*
    默认参数设置
    */
    var defaults = {
        segmentStrokeColor: '', //圆环边框颜色
        segmentStrokeWidth: 0, //圆环边框宽度
        edgeOffset: 0, //svg与外部容器间距
        percentageInnerCutout: 55, //内部空心圆半径相对于大圆半径的百分比,0的话就是饼图了
        animation: true, //是否开启动画
        animationSteps: 40, //动画时间
        animationEasing: 'easeInOutExpo', //动画效果--linear或easeInOutExpo
        animateRotate: true, //转动效果开关
        animateOpacity: true, //渐隐藏效果开关
        startRadius: -120, //其实转动点的角度
        beforeDraw: function() {}, //开始画图前执行函数
        afterDrawed: function() {} //画图完成后执行函数
    };

    function drawPieChart(opts) {
        var id = opts.id;
        if (!id) return;
        var options = opts.options,
            data = opts.data,
            container = document.getElementById(id);

        var W = container.offsetWidth,
            H = container.offsetHeight,
            minSide = Math.min.apply(null, [H / 2, W / 2]),
            centerX = minSide,
            centerY = minSide,
            cos = Math.cos,
            sin = Math.sin,
            PI = Math.PI,
            settings = $extend(defaults, options),
            animationOptions = {
                linear: function(t) {
                    return t;
                },
                easeInOutExpo: function(t) {
                    var v = t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
                    return (v > 1) ? 1 : v;
                }
            },
            requestAnimFrame = function() {
                return window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    function(callback) {
                        window.setTimeout(callback, 1000 / 60);
                    };
            }();

        //画图前执行函数
        settings.beforeDraw.call(this);
        var svg = makeSVG('svg', {
            width: W,
            height: H,
            viewBox: '0 0 ' + W + ' ' + H,
            xmlns: 'http://www.w3.org/2000/svg',
            'xmlns:xlink': 'http://www.w3.org/1999/xlink'
        });
        container.innerHTML = '';
        container.appendChild(svg);
        var paths = [],
            easingFunction = animationOptions[settings.animationEasing],
            radius = minSide - settings.edgeOffset,
            cutoutRadius = radius * (settings.percentageInnerCutout / 100),
            segmentTotal = 0;

        //Set up pie segments wrapper
        var pathGroup = makeSVG('g', {
            opacity: settings.animateOpacity ? '0' : '1'
        });
        svg.appendChild(pathGroup);

        for (var i = 0, len = data.length; i < len; i++) {
            segmentTotal += data[i].value;
            paths[i] = makeSVG('path', {
                'stroke-width': settings.segmentStrokeWidth,
                'stroke': settings.segmentStrokeColor,
                'fill': data[i].color,
                'data-order': i
            });
            pathGroup.appendChild(paths[i]);
        }

        var cnt = settings.animation ? 0 : 1;
        var animFrameAmount = (settings.animation) ? 1 / CapValue(settings.animationSteps, Number.MAX_VALUE, 1) : 1;
        //Animation start
        animationLoop(drawPieSegments);

        function drawPieSegments(animationDecimal) {
            var startRadius = settings.startRadius / 180 * PI;
            var rotateAnimation = 1;
            if (settings.animation && settings.animateRotate) rotateAnimation = animationDecimal; //count up between0~1

            settings.animateOpacity && pathGroup.setAttribute('opacity', animationDecimal);

            //draw each path
            for (var i = 0, len = data.length; i < len; i++) {
                var segmentAngle = rotateAnimation * ((data[i].value / segmentTotal) * (PI * 2)),
                    endRadius = startRadius + segmentAngle,
                    largeArc = ((endRadius - startRadius) % (PI * 2)) > PI ? 1 : 0,
                    startX = centerX + cos(startRadius) * radius,
                    startY = centerY + sin(startRadius) * radius,
                    endX2 = centerX + cos(startRadius) * cutoutRadius,
                    endY2 = centerY + sin(startRadius) * cutoutRadius,
                    endX = centerX + cos(endRadius) * radius,
                    endY = centerY + sin(endRadius) * radius,
                    startX2 = centerX + cos(endRadius) * cutoutRadius,
                    startY2 = centerY + sin(endRadius) * cutoutRadius;
                var cmd = [
                    'M', startX, startY,
                    'A', radius, radius, 0, largeArc, 1, endX, endY, //Draw outer arc path
                    'L', startX2, startY2,
                    'A', cutoutRadius, cutoutRadius, 0, largeArc, 0, endX2, endY2, //Draw inner arc path
                    'Z' //Cloth path
                ];
                paths[i].setAttribute("d", cmd.join(' '));
                startRadius += segmentAngle;
            }
        }

        function animationLoop() {
            requestAnimFrame(animationLoopExec);
            function animationLoopExec(){
                cnt += animFrameAmount;
                var easeAdjustedAnimationPercent = settings.animation ? CapValue(easingFunction(cnt), null, 0) : 1;
                drawPieSegments(easeAdjustedAnimationPercent);
                if (cnt <= 1) {
                    requestAnimFrame(animationLoopExec);
                } else {
                    settings.afterDrawed.call(this);
                }
            }
        }

        function isNumber(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        function CapValue(valueToCap, maxValue, minValue) {
            if (isNumber(maxValue) && valueToCap > maxValue) return maxValue;
            if (isNumber(minValue) && valueToCap < minValue) return minValue;
            return valueToCap;
        }

        function makeSVG(tag, attributes) {
            var elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
            for (var name in attributes) {
                var value = attributes[name];
                elem.setAttribute(name, value);
            }
            return elem;
        }

        function $extend(defaultObj, obj) {
            if (!obj) {
                return defaultObj;
            }
            var result = {};
            for (var o in defaultObj) {
                if (obj && obj.hasOwnProperty(o)) {
                    result[o] = obj[o];
                } else {
                    result[o] = defaultObj[o];
                }
            }
            return result;
        }
    }
    module.exports = drawPieChart.bind(this);
})();
