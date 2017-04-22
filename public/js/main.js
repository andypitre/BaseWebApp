
function myFunction() {
  // use jQuery ($ is shorthand) to find the div on the page and then change the html
  // jQuery can do a lot of crazy stuff so make sure to google around to find out more

  $("#demo").html("NEWWW PARAGRAPH #javascript #fire");

  // 'img-circle' is a bootstrap thing! Check out more here: http://getbootstrap.com/css/
  $("#doge-image").append(`<img class="img-circle" src="/images/wowdoge.jpeg" />`);
}

function deleteRow(key) {
  firebase.database().ref('stream/' + key ).remove();
}

// This function sets up a listener- '.on()' gets called automatically whenever something saved in '/stream/' changes.
// It's main purpose is to iterate over the stream in the database and add each message to the page.
function initializeStreamListener() {
  const databaseStreamReference = firebase.database().ref('/stream/');

  databaseStreamReference.on('value', function(snapshot) {
    var messages = snapshot.val();
    $('#contacts').empty();

    if (messages) {
      Object.keys(messages).forEach(function (key) {
        const message = messages[key];
        console.log(message);
        $('#contacts').append(`
          <div class="contact">
            <div class="first-name">${message.firstName}</div>
            <div class="last-name">${message.lastName}</div>
            <div class="phone-number">${message.phoneNumber}</div>
            <div class="email-address">${message.emailAddress}</div>
            <div class="new-note">${message.newNote}</div>
            <div id="deleteRow" class="delete-col" onClick="deleteRow('${key}')">Delete <i class="fa fa-trash" aria-hidden="true"></i> </div>
          </div>
          `);
      });
    }
  });
}

// This function gets called with the new message information.
// It gets the user information and uses both to add the post to the database.
function addMessage(firstName, lastName, emailAddress, phoneNumber, newNote) {
  var user = firebase.auth().currentUser;
  var authorPic = user.photoURL;
  var author = user.displayName;

  var postData = {
    author: author,
    authorPic: authorPic,
    firstName: firstName,
    lastName: lastName,
    emailAddress: emailAddress,
    phoneNumber: phoneNumber,
    newNote: newNote
  };

  var newPostKey = firebase.database().ref().child('stream').push().key;
  firebase.database().ref('/stream/' + newPostKey).set(postData);
}


// This gets called whenver the form is submitted (check out the index.ejs).
// Uses jQuery to get the message info and passes it to 'addMessage to actually submit the info to firebase.
function handleMessageFormSubmit() {
  var body = $('#new-post-body').val();
  var title = $('#new-post-title').val();
  var firstName = $('#firstName').val();
  var lastName = $('#lastName').val();
  var emailAddress = $('#emailAddress').val();
  var phoneNumber = $('#phoneNumber').val();
  var newNote = $('#newNote').val();

  addMessage(firstName, lastName, emailAddress, phoneNumber, newNote);
  document.getElementById("message-form").reset();
}

// Gets called whenever the user clicks "sign in" or "sign out".
function toggleSignIn() {
  if (!firebase.auth().currentUser) { // if no user, handle login
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    firebase.auth().signInWithPopup(provider).then(function(result) {
      console.log("success");
    }).catch(function(error) {
      console.error("error", error);
    });
  } else { // handle logout
    firebase.auth().signOut();
  }

  //This disables the button until login or logout is successful
  $('#login-button').attr("disabled", true);
}


// The main purpose of this function is to set up a listener (using firebase) for when the auth state changes.
// If a user isn't authenticated, we should not show the stream and prompt them to log in.
// If a use IS authenticated, we should load/show the stream and give them the option to log out.
window.onload = function() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $('#contacts').show();
      $('#login-button').html("Log out");
      initializeStreamListener();
    } else {
      $('#contacts').hide();
      $('#login-button').html("Log in with google");
    }
    $('#login-button').attr("disabled", false);
  });
};
