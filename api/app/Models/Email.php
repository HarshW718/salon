<?php

namespace App\Models;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Illuminate\Database\Eloquent\Model;
use App\Models\SmptDetails;
use Config;

class Email extends Model {

    public static function send_email($subject = '', $body = '', $to = array(), $attachment_file='', $cc = array(), $bcc = array()) {

        $mail = new PHPMailer;
        try {
           $smpt_detail = SmptDetails::orderBy('id', 'DESC')->first(); 
           //print_r($smpt_detail); 
           $mail->isSMTP(); // tell to use smtp
           $mail->CharSet = 'UTF-8'; // set charset to utf8
           $mail->Host = (isset($smpt_detail->mail_host) && $smpt_detail->mail_host != '' && $smpt_detail->mail_host != null) ? $smpt_detail->mail_host : Config::get('mail.host');
           $mail->Port = (isset($smpt_detail->mail_port) &&  $smpt_detail->mail_port != '' && $smpt_detail->mail_port != null) ? $smpt_detail->mail_port :Config::get('mail.port');
           $mail->Username = (isset($smpt_detail->mail_username) && $smpt_detail->mail_username != '' && $smpt_detail->mail_username != null) ? $smpt_detail->mail_username : Config::get('mail.username');
           $mail->Password = (isset($smpt_detail->mail_password) &&  $smpt_detail->mail_password != '' && $smpt_detail->mail_password != null) ? $smpt_detail->mail_password : Config::get('mail.password');
           $mail->SMTPAuth = true;
           $mail->SMTPSecure = "tls";
            $mail->setFrom(Config::get('mail.from.address'), Config::get('mail.from.name'));
            $mail->addReplyTo(Config::get('mail.from.address'), Config::get('mail.from.name'));
            $mail->Subject = $subject;
            $mail->MsgHTML($body);
            if (is_array($to)) {
                foreach ($to as $key => $to_address) {
                    $mail->addAddress($to_address, $to_address);
                }
            } else {
                $mail->addAddress($to, $to);
            }
            if (is_array($cc)) {
                foreach ($cc as $cc_address) {
                    $mail->addCC($cc_address, $cc_address);
                }
            } else {
                $mail->addAddress($cc, $cc);
            }

            if (is_array($bcc)) {
                
                foreach ($bcc as $bcc_address) {
                    $mail->addBCC($bcc_address, $bcc_address);
                }
            } else {
                
                $mail->addBCC($bcc, $bcc);
            }
             $attachment_path = str_replace("api", "uploads/pdf/", base_path());
           
             if($attachment_file != ''){
                 echo $attachment_path;
                // echo $attachment_file;
                $mail->addAttachment($attachment_path.$attachment_file, $attachment_file);
             }
             
            $mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );
            if ($mail->send()) {
                //echo "yes mail sent";
                if($attachment_file != ''){
                    if(file_exists($attachment_path.$attachment_file)){
                        unlink($attachment_path.$attachment_file);
                    }            
                }
                return true;
            } else {
                //echo "no mail sent";
                //echo 'Mailer Error: ' . $mail->ErrorInfo;
                return false;
            }
        } catch (phpmailerException $e) {
            //echo $e;
            return false;
        } catch (Exception $e) {
            //echo $e;
            return false;
        }
    }

}
