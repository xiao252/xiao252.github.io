var log=function(v){
        function formatObj(obj){
            if(obj instanceof Object){
                var des = "";
                for(var names in obj){
                    if(names !="textItem"){
                        des += names + ":" + obj[names] + ";\n";
                    }
                }
                return des.toString();
            }else{
                return obj;
            }
        }
        alert(formatObj(v));
}
function run(){
    if(app.documents.length<1){alert("未发现任何可生成页面！请参照教程布局设计稿","警告",true);return;}
    app.preferences.rulerUnits = Units.PIXELS;
    var adoc = app.activeDocument;
    if(adoc.width.as("px")/adoc.height.as("px")>= 0.7){
        if(!confirm("设计稿高宽比不规范，要继续生成吗？", "提示")) {
             return false;
        }
    }
    var width = 640;
    var height = 1136;
    var resolution = 72;
    var resampleMethod = ResampleMethod.AUTOMATIC;
    var amount = 50;
    adoc.resizeImage(width, height, resolution, resampleMethod, amount);
    var templatePath =new File($.fileName).parent+"/Template/";
    try{
        adoc.rasterizeAllLayers ();
    }catch(err){
        alert("请手动'栅格化所有图层'");
    }
    try{
        var savePath = new Folder(adoc.path + "/H5/");
        if(savePath.exists) {
            if(!confirm("输出目录已存在是否覆盖？", "提示")) {
                return false;
            }
        }
    }catch(err){
        alert('请先保存文件再执行脚本');
        return;
    }
    copyTemplate(templatePath,savePath);
    eachDocument(savePath,adoc);
}
//遍历图层  & 替换模版文件 
function eachDocument(path,adoc){
    var _html="";
    var modeTime = parseFloat(prompt("请输入元素动画间隔", "0.5", "提示"));
	var startMark=1;
	if(confirm("是否指定图片名开始下标？", "提示")){
		startMark = parseInt(prompt("请输入图片名开始下标", "1", "提示"));
	}
    if(isNaN(modeTime)){
        modeTime = 0.5;
    }
    for(var i=0,doc=app.activeDocument.layers;i<app.activeDocument.layers.length;i++){
        if(doc[i].visible){
            if(doc[i].typename == "LayerSet"){
                var resultHtml = replaceSymbol(doc[i],path,startMark,adoc,modeTime);
                if(resultHtml){_html+=resultHtml}
				startMark++;
            }else{
                alert('请按照格式规范[组合,排列]');
                return false;
            }
        }
    }
    if(_html){
            var htmlfile = new File(path + "/index.html");
            var htmlread = "";
            htmlfile.open("r");
            htmlfile.encoding = 'utf-8';
            htmlread = htmlfile.read();
            htmlfile.close();
            htmlread = htmlread.replace("{{content_html}}",_html);
            htmlfile.open("w");
            htmlfile.encoding = 'utf-8';
            htmlfile.write(htmlread);
            htmlfile.close();
    }
}
//生成 html内容 & 图片
function replaceSymbol(set,path,startMark,adoc,modeTime){
    var modeTime_tack = 0;
    var html_page = '\n\t<div class="page">{{imgItem}}\n\t</div>\n';
    var html_bg='\n\t\t<img src="{{BgImgSrc}}" class="full" style="-webkit-animation: scaletest 1s ease-out 0s 1 both">';
    var html_img_t = '\n\t\t<img src="{{imgSrc}}?v=1" style="position:absolute;{{imgCss}}-webkit-animation: fadeInUp 1s ease {{modeTIme}}s 1 both;">';
    var html_img = "";
    var canvasWidth =  app.activeDocument.width.as("px");
    var canvasHeight =  app.activeDocument.height.as("px");
    for(var j=set.layers.length-1;j>=0;j--){
          if(set.layers[j].visible){
                if(set.layers[j].typename != "ArtLayer"){
                    alert('请按照格式规范[组合,排列]');
                    return false;
                }
                if(set.layers[j].bounds[2].as("px")==0&&set.layers[j].bounds[3].as("px")==0){
                    alert("图层不能为空，请隐藏或删除空白图层！重新执行脚本");
                    return false;
                }
                if(j==set.layers.length-1){//背景判断
                    set.layers[j].copy();
                    var width = app.activeDocument.width.as("px");
                    var height = app.activeDocument.height.as("px");
                    app.documents.add(width,height, 72, "boxDoc", NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
                    app.activeDocument.paste();
                    var savepath = new File(path+'/images/bg'+startMark+'.jpg');
                    var exportOptions = new ExportOptionsSaveForWeb();
                    exportOptions.format = SaveDocumentType.JPEG;
                    exportOptions.quality = 100; 
                    app.activeDocument.exportDocument(savepath, ExportType.SAVEFORWEB, exportOptions);
                    var arr = savepath.toString().split('/');
                    html_bg = html_bg.replace("{{BgImgSrc}}",'./images/'+arr[arr.length-1]);
                }else{
                    var x=set.layers[j].bounds[0].as("px");
                    var y=set.layers[j].bounds[1].as("px");
                    var w=set.layers[j].bounds[2].as("px")-x;
                    var h=set.layers[j].bounds[3].as("px")-y;
                    var left=(x/canvasWidth*100).toFixed (3);
                    var top=(y/canvasHeight*100).toFixed (3);
                    var width=(w/canvasWidth*100).toFixed (3);
                    var height=(h/canvasHeight*100).toFixed (3);
                    
                    app.activeDocument.activeLayer = set.layers[j];
                    var region = [
                        [set.layers[j].bounds[0].as('px'), set.layers[j].bounds[1].as('px')],
                        [set.layers[j].bounds[2].as('px'), set.layers[j].bounds[1].as('px')],
                        [set.layers[j].bounds[2].as('px'), set.layers[j].bounds[3].as('px')],
                        [set.layers[j].bounds[0].as('px'), set.layers[j].bounds[3].as('px')]
                    ];
                    var type = SelectionType.REPLACE;
                    var feather = 0;
                    var antiAlias = true;
                    app.activeDocument.selection.select(region, type, feather, antiAlias);
                    app.activeDocument.selection.copy();
                    app.documents.add(w,h, 72, "boxDoc", NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
                    app.activeDocument.paste();
                    
                    var savepath = new File(path+'/images/'+startMark+'-'+(j+1)+'.png');
                    var exportOptions = new ExportOptionsSaveForWeb();
					exportOptions.format = SaveDocumentType.PNG;
                    exportOptions.PNG8 = false;
                    app.activeDocument.exportDocument(savepath,ExportType.SAVEFORWEB, exportOptions);
                    var arr = savepath.toString().split('/');
                    html_img += html_img_t.replace("{{imgSrc}}",'./images/'+arr[arr.length-1]).replace("{{imgCss}}","left:"+left+"%;top:"+top+"%;width:"+width+"%;height:"+height+"%;").replace("{{modeTIme}}",modeTime_tack+=modeTime);
                 }
                app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
                app.activeDocument = adoc;
          }
    }
    return html_page.replace("{{imgItem}}",(html_bg+html_img));
}
//复制模板文件
function copyTemplate(src,target){
       var srcdir = new Folder(src);
	   var targetdir = new Folder(target);
		if(targetdir.exists) {
			targetdir.remove();
		}
		targetdir.create();
		var files = srcdir.getFiles();
		for(var i = 0; i < files.length; i++) {
			var ifile = files[i];
			if(ifile instanceof Folder) {
				copyTemplate(src + '/' + ifile.name, target + '/' + ifile.name);
				continue;
			}
			var ofile = new File(targetdir + '/' + ifile.name);
			if(ofile.exists) {
				ofile.remove();
			}
			ifile.copy(ofile);
		}
}
run();