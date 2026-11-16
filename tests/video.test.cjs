// 李垚飞 24001010723：手机实拍视频嵌入回归检查
const lyf_test=require('node:test');
const lyf_assert=require('node:assert/strict');
const lyf_fs=require('node:fs');
const lyf_path=require('node:path');
const lyf_root=lyf_path.resolve(__dirname,'..');
const lyf_html=lyf_fs.readFileSync(lyf_path.join(lyf_root,'mobile-zoom.html'),'utf8');
lyf_test('任务三具有带控制条和行内播放属性的真实视频播放器',()=>{
 const lyf_tag=lyf_html.match(/<video\b[^>]*id="lyf_phone_demo"[^>]*>/);
 lyf_assert.ok(lyf_tag,'必须嵌入实际video，不能继续展示待补充占位');
 lyf_assert.match(lyf_tag[0],/\bcontrols\b/);lyf_assert.match(lyf_tag[0],/\bplaysinline\b/);lyf_assert.match(lyf_tag[0],/preload="metadata"/);lyf_assert.doesNotMatch(lyf_tag[0],/\bautoplay\b/);
});
lyf_test('视频引用项目内MP4与真实封面，不依赖电脑盘符',()=>{
 lyf_assert.match(lyf_html,/<source src="evidence\/mobile-zoom-phone\.mp4" type="video\/mp4">/);
 lyf_assert.match(lyf_html,/poster="evidence\/mobile-zoom-phone-poster\.jpg"/);
 lyf_assert.ok(lyf_fs.existsSync(lyf_path.join(lyf_root,'evidence/mobile-zoom-phone.mp4')));
 lyf_assert.ok(lyf_fs.existsSync(lyf_path.join(lyf_root,'evidence/mobile-zoom-phone-poster.jpg')));
});
lyf_test('视频为实际MP4文件且单文件小于50MiB',()=>{
 const lyf_file=lyf_path.join(lyf_root,'evidence/mobile-zoom-phone.mp4');
 lyf_assert.ok(lyf_fs.existsSync(lyf_file),'应存在真实视频资源');
 const lyf_stat=lyf_fs.statSync(lyf_file);lyf_assert.ok(lyf_stat.size>100000);lyf_assert.ok(lyf_stat.size<50*1024*1024);
 const lyf_fd=lyf_fs.openSync(lyf_file,'r');const lyf_header=Buffer.alloc(12);try{lyf_fs.readSync(lyf_fd,lyf_header,0,12,0);}finally{lyf_fs.closeSync(lyf_fd);}lyf_assert.equal(lyf_header.toString('ascii',4,8),'ftyp');
});

lyf_test('已切换到用户确认的新video.mp4，不再发布旧43秒录像',()=>{
 const lyf_infoPath=lyf_path.join(lyf_root,'evidence/video-info.json');
 lyf_assert.ok(lyf_fs.existsSync(lyf_infoPath),'需要当前新视频的真实元数据');
 const lyf_info=JSON.parse(lyf_fs.readFileSync(lyf_infoPath,'utf8'));
 lyf_assert.equal(lyf_info.sourceFileName,'video.mp4');
 lyf_assert.ok(lyf_info.durationSeconds>5 && lyf_info.durationSeconds<9);
 lyf_assert.equal(lyf_info.width,1080);lyf_assert.equal(lyf_info.height,1920);
 lyf_assert.equal(lyf_info.userConfirmedGestureCoverage,true);
});
