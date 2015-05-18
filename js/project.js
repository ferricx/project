var songData, currentSortField, ascending = false, greatestId = 0, originalSongData;
$(function () {
    $(".datepicker").datepicker();
});

//a qunit test for song integrity
function testSongItem(songItem) {
    QUnit.test("Song Item Test", function (assert) {
        assert.ok(songItem['Id'].length > 0, "no id set");
        assert.ok(songItem['Title'].length > 0, "no title  set");
        assert.ok(songItem['Artist'].length > 0, "no artist set");
        assert.ok(songItem['Release Date'].length > 0, "no release date set");
        assert.ok(songItem['Price'].length > 0, "no price set")
    });
}

//does ajax call to server to get list of songs
function getSongList() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost/project/json/songs.json',
        dataType: 'json',
        success: function (data) {
            songData = data;
            buildSongData();
        }, error: function (data) {
            alert('failed to get song data');
        }
    });
}

$(document).ready(function () {
    var sortKey, sortType = 'asc';

    getSongList();

    $("#filter-form").submit(function (e) {
        e.preventDefault();
    });

    //sorts object by a propert
    function dynamicSort(property) {
        return function (a, b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result;
        }
    }

    //triggers the sorting by clicks on a column header
    $('body').on('click', '.header', function () {

        if (currentSortField === $(this).text()) {
            ascending = !ascending;
        } else {
            ascending        = true;
            currentSortField = $(this).text();
        }

        if (ascending) {
            songData.reverse(dynamicSort($(this).text()));
            songData.sort(dynamicSort($(this).text()));
        } else {
            songData.sort(dynamicSort($(this).text()));
            songData.reverse(dynamicSort($(this).text()));
        }
        buildSongData();
    });

    //triggers for edit/delete/save for each song
    $('body').on('click', '.utility > a', function () {

        if ($(this).hasClass('utility-edit')) {
            $('.utility > a').hide();
            $('.utility-save').show();
            songId = $(this).parent().data('id');
            buildEditItem(songId);
        } else if ($(this).hasClass('utility-save')) {
            $('.song-edit').submit();
        }
    });

});

//function for updating a song record in the song list
function saveSong() {
    var songItem       = {},
        found          = false,
        songId         = $('.song-edit').attr('id');
        songItem['Id'] = songId;

    $.each($('.song-edit').serializeArray(), function (i, field) {
        songItem[field.name] = field.value;
    });

    $.each(songData, function (index, value) {
        if (value['Id'] == songId) {
            found           = true;
            songData[index] = songItem;
        }
    });
    if (!found) {
        songData.push(songItem);
    }
    buildSongData();
}

//make the ajax call to the server to make the save
function saveList() {
    $.ajax({
        //the random is to simulate failed saves
        url:  'http://localhost/project/json/savesongs' + (oneInRandomFails(5) ? 'fail' : '') + '.json',
        type: 'POST',
        data: songData,
        success: function (data) {
            if (data.success) {
                buildSongData();
            } else {
                alert("save failed");
            }
        },
        error: function (data) {
            alert('failed to save song list');
        }
    });
}

//function for removing filtered results from the visible list
function filterResults() {
    tmpSongData = new Array();
    startDate   = new Date($('#start-date').val());
    endDate     = new Date($('#end-date').val());

    if (!originalSongData) {
        originalSongData = songData;
    }
    $.each(songData, function (index, value) {
        relDate = new Date(value['Release Date']);

        if ((Number(relDate) > Number(startDate)) && (Number(relDate) < Number(endDate))) {
            tmpSongData.push(value);
        }
    });

    songData = tmpSongData;
    buildSongData();
}

//function for returning the list to its original state.
function clearFilter() {
    if (originalSongData) {
        songData = originalSongData;
    }
    buildSongData();
}

//function for mimicking server save fails
function oneInRandomFails(inNumber) {
    roll = Math.floor((Math.random() * inNumber) + 1);
    return (roll === inNumber);
}

// function for taking songData object and making html
function buildSongData() {
    $('.song-list').empty();
    var header = "<div class='song-list-header block-menu-block row'>",
        rows   = "",
        first  = true;
    $.each(songData, function (index, value) {
        testSongItem(value);
        if (value['Id'] > greatestId) {
            greatestId = value['Id'];
        }
        rows += "<div class='song-item row' id='" + value['Id'] + "'>";
        $.each(value, function (ind, val) {
            classname = ind.replace(/ /g, '');
            if (first) {
                header += "<div class='" + classname + " header cell'>" + ind + "</div>"
            }

            rows += "<div class='" + classname + " cell'>" + val + "</div>";
        });
        first = false;
        rows += "<div class='utility cell'  data-id='" + value['Id'] + "'><a class='utility-edit' id='edit'>edit </a><a class='utility-delete' id='delete'>delete </a></div></div>";
    });
    header += "</div>";
    output = header + rows
    $('.song-list').append(output);
    $('.btn-submit').prop('disabled', false);
}

//builds the form for editing
function buildEditItem(songId) {
    $('.btn-submit').prop('disabled', true);
    if (songId) {
        thisSong = $('#' + songId);//+songId);
        row      = "";
        newSong  = false;
    } else {
        newSong    = true;
        thisSong   = "";
        greatestId = parseInt(greatestId) + 1;
        songId     = greatestId;
        row        = "<div class='song-item row' id='" + songId + "'>";
    }

    title  = (thisSong !== "") ? $(thisSong).children('.Title').text() : "";
    artist = (thisSong !== "") ? $(thisSong).children('.Artist').text() : "";
    date   = (thisSong !== "") ? $(thisSong).children('.ReleaseDate').text() : "";
    price  = (thisSong !== "") ? $(thisSong).children('.Price').text() : "";

    row += "<form action='javascript:saveSong()' class='song-edit row' id='" + songId + "' name='song-edit'>" +
    "<div class='Id cell'>" + songId + "</div>" +
    "<input type='text' class='Title cell' name='Title' id='edit-title' value='" + title + "'>" +
    "<input type='text' class='Artist cell' name='Artist' id='edit-artist' value='" + artist + "'>" +
    "<input type='text' class='ReleaseDate datepicker cell' name='Release Date'  id='edit-releaseDate' value='" + date + "'>" +
    "<input type='text' class='Price cell' name='Price' id='edit-title' value='" + price + "'>" +
    "<div class='utility cell' data-id='" + songId + "'><a class='utility-save' id='save'>save</a></div>" +
    "</form>";

    if (newSong) {
        row += "</div>";
        $('.song-list').append(row);
        $('.utility > a').hide();
        $('.utility-save').show();
    } else {
        $(thisSong).empty();
        $(thisSong).append(row);
    }
    $(".datepicker").datepicker();
}