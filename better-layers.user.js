// ==UserScript==
// @name        gats.io better layers
// @match       gats.io
// @run-at      document-start
// @grant       none
// ==/UserScript==

window.addEventListener('load', () => {
window.a41 = function () {
	var duedate = new Date().getTime();
	if (!c4 && !b21 && window.location.pathname != "/model") {
		a29();
	}
	if (c3 != null) {
		j17 = false;
		j58.clearRect(0, 0, canvas.width, canvas.height);
		c2.update();
		a16(j58, c2);
		a37();
		var key;
    a55(j58, c2);
		for (key in RB.pool) {
			RB.pool[key].update();
			RB.pool[key].draw(j58, c2);
		}
    for (key in RA.pool) {
      RA.pool[key].update();
      RA.pool[key].draw(j58, c2);
      RA.pool[key].drawEmission(j58, c2);
		}
    for (key in RC.pool) {
			RC.pool[key].update();
			RC.pool[key].draw(j58, c2);
		}
		for (key in RD.pool) {
			if (!c28 || c28 && RD.pool[key].id != c3) {
				RD.pool[key].drawBody(j58, c2);
				RD.pool[key].drawGun(j58, c2);
				RD.pool[key].update();
			}
		}
		for (key in j27) {
			var n = j27[key];
			if (n.c42 < 5) {
				j26(c2, n.x, n.y);
				n.c42++;
			} else {
				delete n[key];
			}
		}
		var val = RD.pool[c3];
		a9(val);
		a100(val);
		a13(j58, c8);
		a44(j58, j38);
	}
	a113();
	a56();
	var n = RF.list[0];
	if (n !== undefined) {
		n.check();
	}
	var groupsize = new Date().getTime();
	var dragstocreate = groupsize - duedate;
	var ajaxInterval = 16 - dragstocreate;
	if (ajaxInterval < 0) {
		ajaxInterval = 0;
	}
	setTimeout(a41, ajaxInterval);
}});
