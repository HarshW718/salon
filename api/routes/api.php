<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/ 
Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});
Route::post('/signup','Api\UserController@signUp');
Route::post('/check-user-login', 'LoginController@checkUserLogin');
Route::post('/forgot-password', 'LoginController@forgotPassword');
Route::post('/set_new_password','LoginController@setNewPassword');

Route::post('/check_unique_id','LoginController@checkResetPasswordToken');
Route::post('/add-user', 'LoginController@addUser');
Route::get('/sendMail', 'LoginController@sendMail');
Route::get('/check_active_user', 'LoginController@checkActiveUser');
Route::post('/sync_allow','LoginController@syncAllow');
Route::post('/sync_no_allow','LoginController@syncNotAllow');
Route::post('/denied_request','LoginController@deniedRequest');
Route::post('/sync_request','LoginController@syncRequest');
Route::get('/auto_sync','LoginController@autoSync');
Route::get('/test','LoginController@test');

Route::get('/appointmentReminderMail', 'LoginController@appointmentReminderMail');
Route::post('/sendConfirmationEmail', 'LoginController@sendConfirmationEmail');
Route::get('/handleGoogleCallback','LoginController@handleGoogleCallback');
Route::get('/googlelogin/{social}/callback','AppointmentsController@handleGoogleCallback');
/*---- Appointment Start -----*/ 
Route::post('/add_appointment','AppointmentsController@store');
Route::post('/drag_appointment','AppointmentsController@drag_appointment');
Route::post('/drag_blocktime','AppointmentsController@drag_blocktime'); 
Route::post('/adjust_appointment_duration','AppointmentsController@adjust_appointment');
Route::post('/list_appointment','AppointmentsController@index');
Route::post('/list_appointment_by_worker','AppointmentsController@appointments_by_worker');
Route::post('/dt_appointment_list','AppointmentsController@datatable_appointment_list');
Route::post('/update_appointment','AppointmentsController@update');
Route::post('/delete_appointment','AppointmentsController@destroy'); 
Route::post('/check_same_appointment_for_machine','AppointmentsController@check_for_same_appointment'); 
Route::post('/add_block_time','AppointmentsController@store_block_time'); 
Route::post('/update_block_time','AppointmentsController@update_block_time'); 
Route::post('/save_change_service','AppointmentsController@save_change_service');
Route::post('/save_change_customer','AppointmentsController@save_change_customer');
Route::post('/save_appointment_comment','AppointmentsController@save_appointment_comment');
Route::post('/uncheck_appointment','AppointmentsController@uncheck_appointment');
Route::post('/list_appointments_by_customer','AppointmentsController@appointments_by_customer');

Route::post('/list_appointments_by_customer_for_update','AppointmentsController@appointments_by_customer_for_update_page');
Route::post('/list_appointments_by_walking','AppointmentsController@appointments_by_walking_customer');
Route::post('/save_medical_consent_mail','AppointmentsController@saveEmailMedicalConsent');
Route::post('/update_service_from_topay','AppointmentsController@update_service_from_topay');





/*---- Appointment End -----*/

/*---- AppointmentStatusColorController Start -----*/ 
Route::get('/list_appointment_status','AppointmentStatusColorController@index');
Route::post('/dt_appointment_status_list','AppointmentStatusColorController@datatable_appointment_status_list');
Route::post('/update_appointment_status','AppointmentStatusColorController@update');
Route::post('/delete_appointment_status','AppointmentStatusColorController@destroy'); 

/*---- AppointmentStatusColorController End -----*/



/*---- Appointment Log Start -----*/ 

Route::get('/list_appointment_log/{appointment_id}','AppointmentLogController@index');
Route::post('/dt_appointment_log_list','AppointmentLogController@datatable_appointment_log_list');
Route::post('/update_appointment_log','AppointmentLogController@update');
Route::post('/delete_appointment_log','AppointmentLogController@destroy'); 
Route::post('/add_appointment_log','AppointmentLogController@store');
Route::get('/get_appointment_by_id/{appointment_id}','AppointmentsController@getAppointmentById');

/*---- Appointment Log End -----*/

/*---- Appointment Setting Start -----*/
Route::post('/add_appointment_setting','AppointmentSettingController@store');
Route::get('/user_appointment_setting','AppointmentSettingController@index');
Route::post('/dt_appointment_setting_list','AppointmentSettingController@datatable_appointment_setting_list');
Route::post('/update_appointment_setting','AppointmentSettingController@update');
Route::post('/delete_appointment_setting','AppointmentSettingController@destroy'); 

/*---- Appointment Setting End -----*/


/*---- Service Categories Start -----*/
Route::post('/servicesCategories','ServicesCategoriesController@event');
Route::post('/dt_category_list','ServicesCategoriesController@newCategoryList');

Route::get('/list_service_category','ServicesCategoriesController@index');
Route::get('/single_service_category/{cat_id}','ServicesCategoriesController@single_service_category');
Route::get('/list_service_category_forselect','ServicesCategoriesController@serviceCatforSelect'); 
Route::post('/add_service_category','ServicesCategoriesController@store');
Route::post('/update_service_category','ServicesCategoriesController@update');
Route::post('/delete_service_category','ServicesCategoriesController@destroy');
/*---- Service Categories End -----*/

/*---- Staff Start -----*/
 
Route::post('/add_staff','UsersController@addStaff');
Route::post('/edit_staff','UsersController@editStaff');
Route::post('/reset_password','UsersController@resetPassword');
Route::post('/edit_auth_user','UsersController@edit_auth_user');
Route::post('/add_working_time','UsersController@addWorkingTime');
Route::post('/delete_staff','UsersController@destroy');
Route::get('/get_staff_details','UsersController@getStaffDetails');
Route::get('/get_staff_list','UsersController@getStaffList');
Route::get('/customer_created_by/{user_id}','UsersController@singleUserInfo');
Route::get('/worker_list_for_calendar/{worker_id}','UsersController@worker_list');



/*---- Staff End -----*/


/*---- User service Start -----*/

Route::post('/update_user_services','UserServicesController@update_service');


/*---- User service End -----*/



/*---- Service Start -----*/
Route::get('/list_service','ServicesController@index');
Route::get('/list_service_male','ServicesController@list_service_male');
Route::get('/list_service_female','ServicesController@list_service_female');
Route::get('/single_service/{service_id}','ServicesController@single_service');
Route::get('/list_service_with_category','ServicesController@service_list_with_category');
Route::post('/add_service','ServicesController@store');
Route::post('/update_service','ServicesController@update');
Route::post('/delete_service','ServicesController@destroy');
Route::post('/search_service','ServicesController@search_service');
Route::post('/search_service_work_detail','ServicesController@search_service_work_detail');
Route::post('/service_list_for_coupon','ServicesController@servics_and_categories_ForCoupon');
Route::post('/search_service_for_coupon','ServicesController@search_service_ForCoupon');
Route::post('/service_list_at_edit','ServicesController@servics_ForCouponatEdit');
Route::post('/upload_csv_services','ServicesController@upload_csv');

/*---- Service End -----*/


/*---- Tax Start -----*/
Route::get('/list_tax','TaxsController@index');
Route::post('/dt_tax_list','TaxsController@datatable_tax_list');
Route::post('/add_tax','TaxsController@store');
Route::post('/update_tax','TaxsController@update');
Route::post('/delete_tax','TaxsController@destroy'); 
/*---- Tax End -----*/

 
/*---- Product Start -----*/
Route::get('/list_product','ProductsController@index');
Route::post('/add_product','ProductsController@store');
Route::post('/search_products','ProductsController@search_products');
Route::post('/deduct_product_quantity','ProductsController@deduct_product_quantity');


Route::post('/upload_csv_data','ProductsController@upload_csv');
Route::post('/update_product','ProductsController@update');
Route::post('/delete_product','ProductsController@destroy');
Route::post('/delete_product_all','ProductsController@destroyAll');
Route::post('/newProductList','ProductsController@newProductList');
Route::get('/getNewProduct','ProductsController@getNewProduct');
Route::post('/send_sync_request','ProductsController@sendSyncRequest');
Route::post('/dt_sync_list','ProductsController@syncList');

/*---- Product End -----*/

 
/*---- ProductsCategories Start -----*/
Route::get('/list_product_category','ProductsCategoriesController@index');
Route::post('/dt_product_category_list','ProductsCategoriesController@newProductCategoryList');
Route::post('/add_product_category','ProductsCategoriesController@store');
Route::post('/update_product_category','ProductsCategoriesController@update');
Route::post('/delete_product_category','ProductsCategoriesController@destroy');
/*---- ProductsCategories End -----*/


/*---- Companies Start -----*/
Route::get('/list_company','CompaniesController@index');
Route::post('/dt_company_list','CompaniesController@newProductCompanyList');

Route::post('/add_company','CompaniesController@store');
Route::post('/update_company','CompaniesController@update');
Route::post('/delete_company','CompaniesController@destroy');
/*---- Companies End -----*/

/*---- Email template -----*/
Route::post('/email_list','EmailtemplateController@emailList');
Route::post('/save_email_template','EmailtemplateController@saveEmailTemplate');
Route::get('/get_email_template','EmailtemplateController@getEmailTemplate');
Route::post('/delete_email_template','EmailtemplateController@destroy');
/*---- Email template End -----*/

/*---- Placeholder -----*/
Route::get('/placeholder_list','PlaceholderController@index');
/*---- Placeholder End-----*/



/*---- SMS template -----*/
Route::post('/sms_list','SmstemplateController@smsList');
Route::post('/save_sms_template','SmstemplateController@saveSmsTemplate');
Route::get('/get_sms_template','SmstemplateController@getSmsTemplate');
Route::post('/delete_sms_template','SmstemplateController@destroy');
/*---- SMS template End -----*/

 
/*---- Customer Start -----*/
Route::get('/list_customer','CustomersController@index');
Route::post('/dt_list_customers','CustomersController@dt_list_customers');
Route::post('/add_customer','CustomersController@store');
Route::post('/upload_csv_data_customer','CustomersController@upload_csv');
Route::post('/update_customer','CustomersController@update');
Route::post('/delete_customer','CustomersController@destroy');
Route::post('/delete_customer_all','CustomersController@destroyAll');
Route::post('/archive_customer_all','CustomersController@archiveAll'); 
Route::post('/remove_from_archive_customer_all','CustomersController@removeFromArchiveAll');
Route::get('/getNewCustomer','CustomersController@getNewCustomer');
Route::post('/customer_images','CustomersController@customerImage'); 
Route::post('/get_customer_address','CustomersController@checkPostalCode_Address');
Route::post('/customer_for_appointment','CustomersController@appointment_list_customers');
Route::get('/voucher_list/{customer_id}','CustomersController@voucherList');
Route::get('/app_history_list/{customer_id}','CustomersController@appHistoryList');
Route::get('/coupon_list/{customer_id}','CustomersController@couponList');


/*---- Customer End -----*/


/*---- Service Start -----*/
Route::get('/list_images/{customer_id}','ImagesController@images_by_customer_id');
Route::post('/delete_selected_images','ImagesController@destroySelectedImages');
/*---- Service End -----*/


/*---- CouponsServicesController Start -----*/

Route::post('/services_by_coupon_id','CouponsServicesController@services_by_coupon');

/*---- CouponsServicesController End -----*/

/*---- Coupons Start -----*/
Route::post('/dt_coupons_list','CouponsController@coupons_list');
//Route::post('/dt_coupon_list','CouponsController@newProductCategoryList');
Route::post('/add_coupon','CouponsController@store');
Route::post('/update_coupon','CouponsController@update');
Route::post('/delete_coupon','CouponsController@destroy');
Route::get('/coupons_list','CouponsController@index');
// Customer Coupon check Controller By H.N
Route::get('/customer_coupon_get/{id}','MemberController@index');
Route::get('/delete_customer_membership/{id}','MemberController@Delete_customer_membership');

/*---- Coupons End -----*/


/*---- Coupons Start -----*/

Route::post('/coupon_by_id','CustomerCouponsController@single_coupon');
Route::post('/dt_used_coupons_list','CustomerCouponsController@used_coupon_list');
Route::post('/current_customer_coupon','CustomerCouponsController@coupons_by_customer_id');

/*---- Coupons End -----*/


/*---- SMPT Details Start -----*/
Route::get('/smpt_details','SmptdetailsController@index');
//Route::post('/add_smpt_details','SmptdetailsController@store');
Route::post('/update_smpt_details','SmptdetailsController@update');
//Route::post('/delete_smpt_details','SmptdetailsController@destroy'); 
/*---- SMPT Details End -----*/

/*---- Company Details Start -----*/
Route::get('/company_details','CompanydetailsController@index');
Route::post('/update_company_details','CompanydetailsController@update'); 
Route::post('/company_images','CompanydetailsController@companyImage');
Route::post('/delete_company_images','CompanydetailsController@deleteCompanyImages');
/*---- Company Details End -----*/

/*---- UsersExtraWorkingsHour Start -----*/
Route::post('/check_extra_working_hours','UsersExtraWorkingHoursController@check_extra_working_hours');
//Route::post('/dt_users_extra_working_hour_list','UserExtraWorkingHoursController@datatable_users_extra_working_hour_list');
Route::post('/add_users_extra_working_hour','UsersExtraWorkingHoursController@store');
Route::post('/drag_extra_time','UsersExtraWorkingHoursController@drag_extra_time');
Route::post('/update_users_extra_working_hour','UsersExtraWorkingHoursController@update');
Route::post('/delete_users_extra_working_hour','UsersExtraWorkingHoursController@destroy'); 
/*---- UsersExtraWorkingsHour End -----*/

/*---- Cash desk invoice -----*/ 

Route::post('/save_invoice_template','CashdeskInvoiceController@store');
Route::get('/invoice_template_master','CashdeskInvoiceController@index');
Route::post('/update_invoice_template','CashdeskInvoiceController@update');
Route::post('/preview_invoice_template','CashdeskInvoiceController@preview');
Route::get('/payment_method/{setting_or_payment_page}','CashdeskInvoiceController@payment_method');
Route::post('/payment_method_check','CashdeskInvoiceController@update_payment_method');


/*---- Cash desk invoice End -----*/


/*---- Invoice Start -----*/ 

Route::post('/save_invoice','InvoiceController@store');
Route::post('/update_invoice_is_received','InvoiceController@is_received_update');
Route::get('/invoice_number','InvoiceController@invoice_number');
Route::get('/invoice_by_id/{invoice_id}','InvoiceController@single_invoice');
Route::get('/invoice_by_id_for_adjust/{invoice_id}','InvoiceController@single_invoice_adjust'); 
Route::get('/create_invoice/{invoice_id}/{data_id}','InvoiceController@create_invoice');
Route::post('/save_invoice_email','InvoiceController@save_invoice_email');

/*---- invoice End -----*/


/*---- InvoiceDataController Start -----*/ 

Route::get('/gift_list','InvoiceDataController@gift_list');
Route::get('/all_gifts','InvoiceDataController@all_gifts');

/*---- InvoiceDataController End -----*/


/*---- InvoicePaymentController Start -----*/ 

Route::post('/save_payment','InvoicePaymentController@store');
Route::get('/get_payment_by_invoice_id/{invoice_id}','InvoicePaymentController@get_payment_by_invoice_id');

/*---- InvoicePaymentController End -----*/

/*---- InvoiceTemplateController Start -----*/ 

Route::get('/invoice_template','InvoiceTemplateController@invoice_template');

/*---- InvoiceTemplateController End -----*/

/*---- Form builder -----*/
Route::post('/save_report_form','ReportformController@saveReportForm');
Route::post('/dt_form_list','ReportformController@dtFormList');
Route::post('/dt_form_sub_list','ReportformController@dtFormSubList');
Route::get('/get_report_form','ReportformController@getReportForm');
Route::post('/delete_form','ReportformController@destroy');
Route::post('/save_form_sub','ReportformController@saveFormSub');
Route::post('/update_form_sub','ReportformController@updateFormSub');
Route::post('/delete_form_sub','ReportformController@deleteFormSub');
/*---- Form builder End -----*/

/*---- Cash desk dashboard -----*/ 


Route::get('/open_invoice','CasedeskController@index');

Route::get('/unpaid_invoice_total_by_customerid/{customer_id}','CasedeskController@unpaid_invoice_total_by_customerid');



//Route::get('/payment_method','CasedeskController@paymentMethod');

/*---- Cash desk dashboard End -----*/

/*---- Form fill up -----*/
Route::get('/get_form_html','LoginController@getFormHtml');
Route::post('/save_form_ans','LoginController@saveFormAns');
Route::post('/update_form_ans','LoginController@updateFormAns');
/*---- Form fill up End -----*/

/*---- Report -----*/
Route::post('/invoice_report','ReportController@invoiceReport');
Route::get('/invoice_pdf_delete/{pdf_name}','ReportController@invoiceReportPDFDelete');
Route::post('/total_report','ReportController@totalReport');
Route::get('/total_pdf_delete/{pdf_name}','ReportController@totalReportPDFDelete');
Route::post('/sales_report','ReportController@salesReport');
Route::get('/sales_pdf_delete/{pdf_name}','ReportController@salesReportPDFDelete');
/*---- Report End -----*/


/*---- Report -----*/
Route::get('/memos_by_customer_id/{customer_id}','MemosController@memosByCustomerId');
Route::post('/add_memo','MemosController@store');
Route::post('/delete_memo','MemosController@deleteMemo');

//Route::post('/sales_report','MemosController@salesReport');
/*---- Report End -----*/


//Memebership

Route::post('/delete_membership','InvoiceController@delete_membership');







/*---- Check for user authentication after login -----*/
Route::group(['middleware' => ['ApiAuthentication']], function() {
    Route::post('/update-profile','Api\ProfileController@updateProfile');
    Route::post('/update-password','Api\ProfileController@resetPassword');
   
});

Route::post('/dt_form_ans_list','ReportformController@dtFormAnsList');
Route::post('/all_payment_methods','ReportformController@getAllInvoice');
Route::post('/save_pedicure_canvas','ReportformController@saveCanvasData');
Route::post('/delete_pedicure_canvas','ReportformController@deleteCanvasData');
Route::post('/update_pedicure_canvas','ReportformController@updateCanvasData');
Route::post('/get_canvas_all','ReportformController@getCanvasAll');
Route::post('/get_canvas/{id}','ReportformController@getCanvasById');

Route::post('/add_constent_form','ReportformController@addConsentForm');





Route::post('/save_prefix','CasedeskController@addPrefix');
Route::post('/get_prefix','CasedeskController@getPrefix');
Route::post('/update_prefix','CasedeskController@updatePrefix');
Route::post('/delete_prefix','CasedeskController@deleteePrefix');



Route::get('/get_invoice_password','InvoicePasswordController@getInvoicePassword');
Route::post('/save_invoice_password','InvoicePasswordController@saveInvoicePassword');


Route::post('/cash_counter_in','CashdeskInvoiceController@CashCounterIn');
Route::post('/dt_cash_in_out','CashdeskInvoiceController@CashCounter');

Route::post('/getCanvasReport','ReportformController@getCanvasReport');
Route::post('/getCanvasReportList','ReportformController@getCanvasReportList');
Route::get('/customer_medical_report/{id}','ReportformController@customerMedicalReport');
Route::post('/getReportDesc','ReportformController@getMedicalReportDesc');

Route::get('/testworker','LoginController@testworker');
