/**
 * Created by liuqiangjian on 10/13/2016.
 */

var Step = require('../../utils/Step');

function testStep() {
    Step.Step(function (result, entire) {
        console.log(result); // undefined
        console.log(entire); // []
        var that = this;

        that.step('abc');

    }, function (result, entire) {
        console.log(result); // 'abc'
        console.log(entire); // ['abc']

        //stop可以控制停止步骤
        //this.stop();
        //end可以跳到最后一步，并添加数据
        //this.end({"end":"true"});
        //return ::返回一个非undefined的值，和调用this.step();效果相同
        /*注意：如果未返回数据，或者未调用this.step()，将会中断回调的执行，后面的回调都不会执行！！！*/
        return 123;
    }, function (result, entire) {
        console.log(result); // 'abc'  ::此值为上一个回调执行的结果
        console.log(entire); // ['abc', 123]  ::此值为历史所有回调执行结果按次序组成的数组
        var that = this;
        that.step({abc: 123});
        console.log(that.index); //that.index为一个整数，代表回调被调用的次序，而不是返回结果的次序。
    }, function (result, entire) {
        console.log(result); // {abc:123}
        console.log(entire); // [ 'abc', 123, { abc: 123 } ]
    });
}

function testAssme() {
    Step.Assem(function (step, index) {
        var that = this;
        setTimeout(function () {
            //that.index为一个整数，代表回调被调用的次序，而不是返回结果的次序。
            console.log("0 is " + (that.index == 0));
            that.step('abc'); //表示数据获取完毕
        }, 200);
    }, function () {
        var that = this;
        console.log("1 is " + (that.index == 1));
        //return ::返回一个非undefined的值，和调用this.step();效果相同
        /*注意：如果未返回数据，或者未调用this.step()，将会导致最终的数据处理程序不被调用！！！*/
        return 123;
    }, function () {
        var that = this;
        that.step({abc: 123});
        console.log("2 is " + (that.index == 2));
    }, function (result) {
        console.log(result); // [ 'abc', 123, { abc: 123 } ]
    });
}
testAssme();
