var access_token;
var _baseUri = 'https://api.spotify.com/v1';
var output_div = $('#throwback-output');
var release;
var count = 0;
var offset = 100;

(function() {
    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    var userProfileSource = document.getElementById('user-profile-template').innerHTML,
        userProfileTemplate = Handlebars.compile(userProfileSource),
        userProfilePlaceholder = document.getElementById('user-profile');

    var oauthSource = document.getElementById('oauth-template').innerHTML,
        oauthTemplate = Handlebars.compile(oauthSource),
        oauthPlaceholder = document.getElementById('oauth');

    var params = getHashParams();

    access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if (error) {
        alert('There was an error during the authentication');
    } else {
        if (access_token) {
            // render oauth info
            oauthPlaceholder.innerHTML = oauthTemplate({
                access_token: access_token,
                refresh_token: refresh_token
            });

            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {
                    userProfilePlaceholder.innerHTML = userProfileTemplate(response);

                    $('#login').hide();
                    $('#loggedin').show();
                }
            });
        } else {
            // render initial screen
            $('#login').show();
            $('#loggedin').hide();
        }

        document.getElementById('obtain-new-token').addEventListener('click', function() {
            $.ajax({
                url: '/refresh_token',
                data: {
                    'refresh_token': refresh_token
                }
            }).done(function(data) {
                access_token = data.access_token;
                oauthPlaceholder.innerHTML = oauthTemplate({
                    access_token: access_token,
                    refresh_token: refresh_token
                });
            });
        }, false);
    }
})();

function createTB() {
    $.ajax({
        url: _baseUri + '/users' + '/1263763228' + '/playlists' + '/2H0uq1kt3Rrjqer1g9t6d1' + '/tracks' + '?offset=' + offset,
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    }).done(function(data) {
        for (i = 0; i < data.items.length; i++) {
            $.ajax({
                url: _baseUri + '/albums/' + data.items[i].track.album.id,
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                async: false
            }).done(function(data2) {
                release = parseInt(data2.release_date.substring(0,4));
            });
            if (i != data.items.length - 1) {
                if (release < 2010) {
                    output_div.append(data.items[i].track.name + " - " + release + ", ");
                    count++;
                }
            } else {
                if (release < 2010) {
                    output_div.append(data.items[i].track.name + " - " + release);
                    count++;
                }
            }
        }
        console.log(count);
    });
}
