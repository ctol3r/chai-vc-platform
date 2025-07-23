(function(){
  function init(){
    var script = document.currentScript;
    var credentialId = script.getAttribute('data-credential-id');
    if(!credentialId) return;
    fetch(script.src.replace(/widget\.js$/, '') + 'verify/' + credentialId)
      .then(function(resp){return resp.json();})
      .then(function(data){
        var container = document.createElement('div');
        container.style.border = '1px solid #ccc';
        container.style.padding = '8px';
        container.style.maxWidth = '200px';
        container.innerText = 'Credential ' + data.credential_id + ': ' +
          (data.verified ? 'Verified' : 'Not verified');
        script.parentNode.insertBefore(container, script.nextSibling);
      });
  }
  if(document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else init();
})();
