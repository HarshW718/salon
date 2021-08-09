
<html xmlns="http://www.w3.org/1999/xhtml"><body style="margin:0px; background: #f8f8f8; ">
        <div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;">
            <div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px">
                <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px">
                    <tbody>
                        <tr>
                            <td style="vertical-align: top; padding-bottom:30px;" align="center"> Neurlab </td>
                        </tr>
                    </tbody>
                </table>
                <div style="padding: 40px; background: #fff;">
                    <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                        <tbody>
                            <tr>
                                <td><b>Dear user {{$receiver['username']}} ,</b>
                                    <p>you can reset your password at following page: {{$activtionUrl}}</p>
                                    <p>Your password reset link will expire at {{$token_expire}}. If you did not request this email. Please, do not hesitate to contact us by replying this email. Your LedgerXFund team. http://dev1.neurlab.com Requested at {{$token_created}}
</p>

                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px">
                    <p> Mail by : {{$sender}} </p>
                </div>
            </div>
        </div>
    </body>
</html>