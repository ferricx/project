# SongProject
Christian Ferrier

This a song library manager web app. 

Features:
Sorting by any attribute ascending and descending.
Adding songs.
Deleting songs.
Filtering songs by Release Date.
Server side saving.
Responsive design.

All of the server side interactions are mocked up due to the scope of this project.

Future release will include form validation on the text and datepicker inputs. These were not included in this release due to the scope of this project.

The form to edit a song is built dynamically using javascript and jQuery. This form could be prebuilt in the index file and hidden and when it is needed, it could be copied, appended to the song-list div and unhidden. Since this was primarily an exercise in javascript and jQuery, I chose to use those tools to build it on the fly.

I am not sure that I have implemented Qunit as efficiently as I could have. I would like some clarity on the correct usage. It seems like the functions should probably be in their own .js file and loaded for testing and just not loaded when testing is complete.

The savesongs.json and savesongsfail.json files are to simulate serverside song saves and fails.
