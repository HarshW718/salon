<?php
namespace App\Message;
class Message 
{
    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $exception
     * @return \Illuminate\Http\Response
     */
    public static function getMessage($code)
    {
        return Message::MessageList()[$code];
    }
    /**
	 * [MessageList collection of array]
	 */
	public static function MessageList(){
        return array(
            "1"=> 'Something Wrong',
            "2"=> 'Successful',
            "3"=> 'Preferences added successfully.',
            "4"=> 'Preferences not added successfully.',
            "5"=> 'Business is successfully added to favourite list',
            "6"=> 'Business is successfully removed from favourite list',
        );
    }

}
