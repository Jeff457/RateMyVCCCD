/**
 * RateMyVCCCD
 * Author: Jeff Stanton
 * Last updated: Nov 2 2016
 */

function main() {
    var instructors1 = document.getElementsByClassName("default1");  //Get the first half of the table
    var instructors2 = document.getElementsByClassName("default2");  //Get the second half of the table
    var professors = [];
    var count = 0;

//Extract Professor names from table 1
//Add instructor name to profesors array
    for (var i = 0; i < instructors1.length; i++) {
        if (instructors1[i].innerHTML.indexOf(',') > -1) {
            professors.push(instructors1[i].innerHTML);
            addButton(professors, instructors1[i], count, i);
            count++;
        }
    }

//Extracts Professor names from table 2
//Add instructors name to professors array
    for (var i = 0; i < instructors2.length; i++) {
        if (instructors2[i].innerHTML.indexOf(',') > -1) {
            professors.push(instructors2[i].innerHTML);
            addButton(professors, instructors2[i], count, i);
            count++;
        }
    }
}

function addButton(professors, instructor, count, i) {
    var div = document.createElement('div');  // cell where the button will go
    var searchName = '';
    var nameArray = professors[count].split(' ');  // check if professor's last name is two words

    if (nameArray.length == 1) {  // special case for single name
        searchName = nameArray[0];
        div.firstName = ' ';
    }
    else if (nameArray[1].length > 1) {
        searchName = nameArray[0] + ' ' + nameArray[1];
        if (nameArray.length == 2)  // when first name isn't provided, make it blank and check it later
            div.firstName = ' ';
        else
            div.firstName = nameArray[2];
    }
    else {
        searchName = nameArray[0];
        div.firstName = nameArray[1];
    }

    div.searchURL = 'http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=moorpark+college&queryoption=HEADER&query=' + searchName + '&facetSearch=true';
    div.profURL = '';
    div.innerHTML = '<input class="ratingButton" type="button" value="SHOW RATING" />';
    div.cell = document.createElement('div');
    div.clicked = false;
    div.addEventListener('click', openPopup);
    instructor.appendChild( document.createTextNode(" ") );
    instructor.appendChild(div);
}

function openPopup() {
    if (this.clicked == true) { //happens when button was clicked while active
        this.cell.innerHTML = '';
        this.innerHTML = '<input class="ratingButton" type="button" value="SHOW RATING" />';
        this.clicked = false;
    } else { //happens when button was clicked while inactive
        this.clicked = true;
        this.innerHTML = '<input class="ratingButton" type="button" value="HIDE RATING" />';
        var popup = document.createElement('div');
        popup.className = 'popup';
        popup.innerText = 'Loading...';
        var firstName = this.firstName;
        this.cell.style.position = 'relative';
        this.cell.appendChild(popup);

        chrome.runtime.sendMessage({
            url: this.searchURL
        }, function(responseText) {
            responseText = responseText.replace('http://blog.ratemyprofessors.com/wp-content/uploads/2015/01/WNOs6.5_RMP_72x72.jpg', '');
            responseText = responseText.replace('/assets/chilis/warm-chili.png', '');
            responseText = responseText.replace('/assets/chilis/cold-chili.png', '');
            processFirstRequest(popup, firstName, responseText);
        });
    }
}

//function that processes first request from ratemyprofessors and makes second request
function processFirstRequest(popup, firstName, responseText) {
    var tmp = document.createElement('div'); //make a temp element so that we can search through its html
    tmp.innerHTML = responseText;
    var foundProfs = tmp.getElementsByClassName('listing PROFESSOR');

    if (foundProfs.length == 0) //if no results were returned, print this message
    {
        var emptyPopup = popup;
        emptyPopup.className = 'notFoundPopup';
        var notFound = document.createElement('div');
        var idk = document.createElement('div');
        notFound.className = 'heading';
        idk.className = 'idk';
        notFound.innerText = "Professor not found";
        idk.innerText = "¯\\_(ツ)_/¯";
        emptyPopup.innerHTML = '';
        emptyPopup.appendChild(notFound);
        emptyPopup.appendChild(idk);
    } else //iterate through the search results and match by first letter of first name to verify identity
    {
        var length = foundProfs.length;

        for (var i = 0; i < length; i++) {
            var tmp = document.createElement('div');
            tmp.innerHTML = foundProfs[i].innerHTML;
            var name = tmp.getElementsByClassName('main')[0].innerText;

            if ((firstName.charAt(0) == name.split(',')[1].charAt(1)) || (firstName == ' ')) {
                break;
            } else if (i == length - 1) {
                var emptyPopup = popup;
                emptyPopup.className = 'notFoundPopup';
                var notFound = document.createElement('div');
                var idk = document.createElement('div');
                notFound.className = 'heading';
                idk.className = 'idk';
                notFound.innerText = "Professor not found";
                idk.innerText = "¯\\_(ツ)_/¯";
                emptyPopup.innerHTML = '';
                emptyPopup.appendChild(notFound);
                emptyPopup.appendChild(idk);
                return 0;
            }
        }

        //get the link for the actual professor page
        var link = tmp.getElementsByTagName('a');
        profURL = 'http://www.ratemyprofessors.com/' + link[0].toString().slice(23); //this is the URL

        chrome.runtime.sendMessage({
            url: this.profURL
        }, function(responseText) {
            responseText = responseText.replace('http://blog.ratemyprofessors.com/wp-content/uploads/2015/01/WNOs6.5_RMP_72x72.jpg', '');
            responseText = responseText.replace('/assets/chilis/warm-chili.png', '');
            responseText = responseText.replace('/assets/chilis/cold-chili.png', '');
            addContentToPopUp(popup, profURL, responseText);
        });
    }
}

//function that adds content to popup
function addContentToPopUp(popup, profURL, responseText) {
    var tmp = document.createElement('div');
    tmp.innerHTML = responseText;
    console.log("test1");

    //check if professor has any reviews
    //if they have no reviews then just display the professor not found popup
    if (tmp.getElementsByClassName('pfname').length == 0)
    {
        var emptyPopup = popup;
        emptyPopup.className = 'notFoundPopup';
        var notFound = document.createElement('div');
        var idk = document.createElement('div');
        notFound.className = 'heading';
        idk.className = 'idk';
        notFound.innerText = "Professor not found";
        idk.innerText = "¯\\_(ツ)_/¯";
        emptyPopup.innerHTML = '';
        emptyPopup.appendChild(notFound);
        emptyPopup.appendChild(idk);
        return;
    }

    var proffName = tmp.getElementsByClassName('pfname')[0].innerText;
    var proflName = tmp.getElementsByClassName('plname')[0].innerText;
    var ratingInfo = tmp.getElementsByClassName('left-breakdown')[0];
    var numRatings = tmp.getElementsByClassName('table-toggle rating-count active')[0].innerText;
    tmp.innerHTML = ratingInfo.innerHTML;

    //get the raw rating data
    var ratings = tmp.getElementsByClassName('grade');

    var scale = " / 5.0";
    var overall = ratings[0];
    var wouldTakeAgain = ratings[1];
    var difficulty = ratings[2];
    tmp.remove();

    //create the ratings divs
    var profNameDiv = document.createElement('div');
    var overallDiv = document.createElement('div');
    var overallTitleDiv = document.createElement('div');
    var overallTextDiv = document.createElement('div');
    var wouldTakeAgainDiv = document.createElement('div');
    var wouldTakeAgainTitleDiv = document.createElement('div');
    var wouldTakeAgainTextDiv = document.createElement('div');
    var difficultyDiv = document.createElement('div');
    var difficultyTitleDiv = document.createElement('div');
    var difficultyTextDiv = document.createElement('div');
    var numRatingsDiv = document.createElement('div');

    //assign class names for styling
    profNameDiv.className = 'heading';
    overallDiv.className = 'overall';
    overallTitleDiv.className = 'title';
    overallTextDiv.className = 'text';
    wouldTakeAgainDiv.className = 'would_take_again';
    wouldTakeAgainTitleDiv.className = 'title';
    wouldTakeAgainTextDiv.className = 'text';
    difficultyDiv.className = 'difficulty';
    difficultyTitleDiv.className = 'title';
    difficultyTextDiv.className = 'text';
    numRatingsDiv.className = 'numRatings';

    //put rating data in divs
    profNameDiv.innerHTML = proffName + " " + proflName; //'<a href="' + profURL + '" target="_blank">' + proffName + " " + proflName + '</a>';
    overallTitleDiv.innerText = 'Overall Quality';
    overallTextDiv.innerText = overall.innerHTML.trim().concat(scale);
    wouldTakeAgainTitleDiv.innerText = 'Would Take Again';
    wouldTakeAgainTextDiv.innerText = wouldTakeAgain.innerHTML.trim();
    difficultyTitleDiv.innerText = 'Difficulty';
    difficultyTextDiv.innerText = difficulty.innerHTML.trim().concat(scale);

    numRatings = numRatings.slice(9).split(' ')[0] //check to see if "ratings" is singular or plural
    if (numRatings == '1') {
        numRatingsDiv.innerHTML = '<a href="' + profURL + '" target="_blank">' + numRatings + ' rating</a>';
    } else {
        numRatingsDiv.innerHTML = '<a href="' + profURL + '" target="_blank">' + numRatings + ' ratings</a>';
    }

    popup.innerHTML = ''; //remove 'loading...' text

    //add divs to popup
    overallTitleDiv.appendChild(overallTextDiv);
    overallDiv.appendChild(overallTitleDiv);
    wouldTakeAgainTitleDiv.appendChild(wouldTakeAgainTextDiv);
    wouldTakeAgainDiv.appendChild(wouldTakeAgainTitleDiv);
    difficultyTitleDiv.appendChild(difficultyTextDiv);
    difficultyDiv.appendChild(difficultyTitleDiv);

    popup.appendChild(profNameDiv);
    popup.appendChild(overallDiv);
    popup.appendChild(wouldTakeAgainDiv);
    popup.appendChild(difficultyDiv);
    popup.appendChild(numRatingsDiv);
}

main();