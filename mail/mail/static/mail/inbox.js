document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').onsubmit = submit_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#error-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function submit_email(){
  const compose_recipients = document.querySelector('#compose-recipients').value;
  const compose_subject = document.querySelector('#compose-subject').value;
  const compose_body = document.querySelector('#compose-body').value;
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: compose_recipients,
        subject: compose_subject,
        body: compose_body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      if ("error" in result){
        showError(result["error"]);
      }
      else{
        load_mailbox('sent');
      }
      
      
  });
  return false;
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#error-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
      emails.forEach(element => {
        const new_div = document.createElement('div');
        new_div.classList.add('box');
        new_div.innerHTML = `
          <div>Subject: ${element.subject}</div>
          <div>Sender: ${element.sender}</div>
          <div>Date: ${element.timestamp}</div>`
          if (mailbox === 'inbox' && element.read === true){
            new_div.classList.add('is_read');
          }
          document.querySelector('#emails-view').append(new_div);
          new_div.addEventListener('click', () => load_email(element.id)); 
      });     
  });
}

function load_email(id){
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#error-view').style.display = 'none';
  
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email =>{
  const new_div = document.querySelector('#emails-view');
    new_div.innerHTML = `
    <div>From: ${email.sender}</div>
    <div>To: ${email.recipients}</div>
    <div>Subject: ${email.subject}</div>
    <div>Timestamp: ${email.timestamp}</div>            
          
    <div class="email-buttons">
        <button class="btn-email" id="reply">Reply</button>
        <button class="btn-email" id="archive">${email["archived"] ? "Unarchive" : "Archive"}</button>
    </div>
    <hr>
    <div>
        ${email.body}
    </div>`
    document.querySelector('#archive').addEventListener('click', () => setArchive(email.id, email.archived));
    document.querySelector('#reply').addEventListener('click', () => reply_email(email))
  })
}

function setArchive(id, archived){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !archived
    })
  }).then( () => load_mailbox("inbox"));
}

function reply_email(email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#error-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = email.recipients;
  document.querySelector('#compose-subject').value = email.subject;
  document.querySelector('#compose-body').value = email.body;
}

function showError(result){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#error-view').style.display = 'block';

  document.querySelector('#error-view').innerHTML = result;
}