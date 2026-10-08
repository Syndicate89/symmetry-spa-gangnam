const menuButton=document.querySelector('.menu-toggle');
const mobileMenu=document.querySelector('#mobile-menu');
function closeMenu(){menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','메뉴 열기');mobileMenu.hidden=true;}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');mobileMenu.hidden=!open;});
mobileMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mobileMenu.hidden){closeMenu();menuButton.focus();}});
window.matchMedia('(min-width:761px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
const photoDialog=document.querySelector('.photo-dialog');
document.querySelectorAll('.gallery-photo').forEach(button=>button.addEventListener('click',()=>{const image=photoDialog.querySelector('img');image.src=button.dataset.src;image.alt=button.dataset.caption;photoDialog.querySelector('p').textContent=button.dataset.caption;photoDialog.showModal();}));
photoDialog.querySelector('.dialog-close').addEventListener('click',()=>photoDialog.close());
photoDialog.addEventListener('click',event=>{if(event.target===photoDialog){const rect=photoDialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)photoDialog.close();}});
document.getElementById('year').textContent=String(new Date().getFullYear());
