# HomeBill
家庭记账

入库数据解决思路：
1、通过webservice直接入库mysql，并发送同步monge与mysql消息（insert、update、delete）。
2、同步模块是另起线程的，接收消息，向webservice发送同步请求，更新mongo数据状态。
3、主线程监听同步线程消息，返回汇总视图。

查询数据解决思路：
1、简单的视图查询本地mongo即可，
2、复杂视图（多对多）调用webservice查询mysql。

session-cookie配置一下

所有的资源要压缩处理

excel导入导出

分页数据

highcharts图标展示


