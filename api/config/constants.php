<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Application Name
    |--------------------------------------------------------------------------
    |
    | This value is the name of your application. This value is used when the
    | framework needs to place the application's name in a notification or
    | any other location as required by the application or its packages.
    */
    'loginUrl' => 'http://' . $_SERVER['HTTP_HOST'] . '/#!/login/signin',
     'activationUrl' => 'http://' . $_SERVER['HTTP_HOST'] . '/#!/',
     'imageUrl' => $_SERVER['DOCUMENT_ROOT'].'/',
     'displayImageUrl' => 'https://' . $_SERVER['HTTP_HOST'] . '/',
];
