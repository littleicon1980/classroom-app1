import re,base64,sys,os,json
SRC="/home/claude/classroom-dashboard-working/Classroom Dashboard.html"
ROOT="/home/claude/mobile-apps"
s=open(SRC,encoding="utf-8").read()
def b64(p): return "data:image/png;base64,"+base64.b64encode(open(p,"rb").read()).decode()
# --- remove school / ministry identity -> neutral branding
s,n1=re.subn(r'var HDR_IMG = "[^"]*";','var HDR_IMG = "%s";'%b64(ROOT+"/tools/hdr.png"),s)
s,n2=re.subn(r'var FTR_IMG = "[^"]*";','var FTR_IMG = "%s";'%b64(ROOT+"/tools/ftr.png"),s)
s,n3=re.subn(r'var DASH_SCHOOL = "[^"]*";','var DASH_SCHOOL = "لوحة إدارة الصف";',s)
s=s.replace("مدرسة محمد بن عبد الوهاب","لوحة إدارة الصف")
s=s.replace("نافذة إدارة سلوك الطلاب والإدارة الصفية","الحضور · السلوك · الدرجات · أدوات الصف")
s=s.replace("Mohammed Bin Abdul Wahhab Secondary School","Classroom Dashboard").replace("Mohammed Bin Abdul Wahhab School","Classroom Dashboard")
s=s.replace("Student behaviour & classroom management window","Attendance · Behaviour · Grades · Classroom tools")
assert (n1,n2,n3)==(1,1,1)
assert "محمد بن عبد الوهاب" not in s and "Qatar" not in s and "Wahhab" not in s
# --- mobile viewport + native shim
s=s.replace('<meta name="viewport" content="width=device-width, initial-scale=1">','<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',1)
shim=open(ROOT+"/tools/native-shim.js",encoding="utf-8").read()
def build(flavor):
    t=s
    inj="<script>"+shim+"</script>"
    if flavor=="demo":
        seed=open(ROOT+"/tools/demo-seed.json",encoding="utf-8").read()
        inj+="<script>try{if(!localStorage.getItem('classroom-dashboard-v1'))localStorage.setItem('classroom-dashboard-v1',"+json.dumps(seed)+");}catch(e){}</script>"
    t=t.replace('viewport-fit=cover">','viewport-fit=cover">\n'+inj,1)
    return t
os.makedirs(ROOT+"/www",exist_ok=True); os.makedirs(ROOT+"/www-demo",exist_ok=True)
open(ROOT+"/www/index.html","w",encoding="utf-8").write(build("clean"))
open(ROOT+"/www-demo/index.html","w",encoding="utf-8").write(build("demo"))
import shutil
for d in ("www","www-demo"): shutil.copyfile(os.path.join(os.path.dirname(os.path.abspath(__file__)),"opencv.js"), ROOT+"/"+d+"/opencv.js")
print("built", os.path.getsize(ROOT+"/www/index.html"))
