<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;


class Products extends Model
{
    
    protected $fillable = ['id', 'name', 'created_at', 'updated_at', 'category_id', 'company_id', 'tax_id', 'ean', 'sku', 'stocke', 'min_stocke', 'type', 'sale_price', 'purchase_price', 'created_by','updated_by','user_company_id' ];
  
    public function product_category()
    {
        return $this->hasOne('App\Models\ProductsCategories','id','category_id');
    }
    public function product_company()
    {
        return $this->hasOne('App\Models\Companies','id','company_id');
    }
    
    public static function product_list($params = array()) {
        $where='';
	$where="where id !='' AND user_company_id= ".$params['user_company_id']."";
        $query = Products::query();
        if (isset($params['search']) && !empty($params['search'])) {
             $where .=" and (name like '%".$params['search']."%' or category_name like '%".$params['search']."%' or company_name like '%".$params['search']."%' or ean like '%".$params['search']."%' or sku like '%".$params['search']."%' or tax_name like '%".$params['search']."%' or stocke like '%".$params['search']."%' or min_stocke like '%".$params['search']."%' or sale_price like '%".$params['search']."%' or purchase_price like '%".$params['search']."%' or shortage like '%".$params['search']."%') ";
        }
        return $invoicesQry = DB::select( DB::raw("SELECT q.* from (select *,(stocke-min_stocke) as shortage,(select name from products_categories WHERE products_categories.id=products.category_id) as category_name,(select name from companies WHERE companies.id=products.company_id) as company_name,(select name from taxs WHERE taxs.id=products.tax_id) as tax_name from products ) as q ".$where." order by {$params['sort_by']} {$params['sort_order']} limit {$params['start']},{$params['limit']} "));
       
    }
    public static function product_listCount($params = array()) {
        $where='';
        $where="where id !='' AND user_company_id=".$params['user_company_id'];
        if (isset($params['search']) && !empty($params['search'])) {
            $where .=" and (name like '%".$params['search']."%' or category_name like '%".$params['search']."%' or company_name like '%".$params['search']."%' or ean like '%".$params['search']."%' or sku like '%".$params['search']."%' or tax_name like '%".$params['search']."%' or stocke like '%".$params['search']."%' or min_stocke like '%".$params['search']."%' or sale_price like '%".$params['search']."%' or purchase_price like '%".$params['search']."%' or shortage like '%".$params['search']."%') ";
        }
        $totalcountQry = DB::select( DB::raw("SELECT count(q.id) as totalRecord from (select *,(stocke-min_stocke) as shortage,(select name from products_categories WHERE products_categories.id=products.category_id) as category_name,(select name from companies WHERE companies.id=products.company_id) as company_name,(select name from taxs WHERE taxs.id=products.tax_id) as tax_name from products  ) as q ".$where));
	return $totalcount = $totalcountQry[0]->totalRecord;
    }
    public static function getNewProduct($id) {
        return DB::select( DB::raw("select * from products WHERE id=".$id));
    }
    public static function syncProductCompany($data){
        $masterCompanyData = DB::select( DB::raw("SELECT name,id as master_id FROM companies where id not in 

(
   select  DISTINCT master_product_company_id from sync_product_company_logs WHERE ((from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId']." ) || (from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ))

UNION

select  DISTINCT new_product_company_id from sync_product_company_logs WHERE ((from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId']." ) || (from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ))

)

AND user_company_id!=".$data['toId']." and user_company_id=".$data['fromId'].""));
        
        for($i=0;$i<count($masterCompanyData);$i++){
            $insert=[];
            $insert['name']=$masterCompanyData[$i]->name;
            $insert['user_company_id']=$data['toId'];
            $insert['created_by']=$data['toId'];
            $insert['updated_by']=$data['toId'];
            $insert['created_at']=date('Y-m-d H:i:s');
            $insert['updated_at']=date('Y-m-d H:i:s');
            
            $lastdata=DB::table('companies')->insertGetId($insert);
            
            $insertToSync=[];
            $insertToSync['master_product_company_id']=$masterCompanyData[$i]->master_id;
            $insertToSync['new_product_company_id']=$lastdata;
            $insertToSync['from_user_company_id']=$data['fromId'];
            $insertToSync['to_user_company_id']=$data['toId'];
            $insertToSync['created_by']=$data['toId'];
            $insertToSync['updated_by']=$data['toId'];
            
            DB::table('sync_product_company_logs')->insertGetId($insertToSync);

        }
    }
    
    public static function syncProductCategory($data){
       
        $masterCategoryData = DB::select(  DB::raw("SELECT name,id as master_id FROM products_categories where id not in 

(
   select  DISTINCT master_product_cat_id from sync_product_cat_logs WHERE ((from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId']." ) || (from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ))

UNION

select  DISTINCT new_product_cat_id from sync_product_cat_logs WHERE ((from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId']." ) || (from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ))

)

AND user_company_id!=".$data['toId']." and user_company_id=".$data['fromId'].""));
        
        for($i=0;$i<count($masterCategoryData);$i++){
            $insert=[];
            $insert['name']=$masterCategoryData[$i]->name;
            $insert['user_company_id']=$data['toId'];
            $insert['created_by']=$data['toId'];
            $insert['updated_by']=$data['toId'];
            $insert['created_at']=date('Y-m-d H:i:s');
            $insert['updated_at']=date('Y-m-d H:i:s');
            
            $lastdata=DB::table('products_categories')->insertGetId($insert);
            
            $insertSync=[];
            $insertSync['master_product_cat_id']=$masterCategoryData[$i]->master_id;
            $insertSync['new_product_cat_id']=$lastdata;
            $insertSync['from_user_company_id']=$data['fromId'];
            $insertSync['to_user_company_id']=$data['toId'];
            $insertSync['created_by']=$data['toId'];
            $insertSync['updated_by']=$data['toId'];
            
            DB::table('sync_product_cat_logs')->insertGetId($insertSync);
        }
    }
    public static function syncTax($data){
        $masterTaxData = DB::select(  DB::raw("SELECT tax_value,name,id as master_id FROM taxs where id not in 

(
   select  DISTINCT master_tax_id from sync_tax_logs WHERE ((from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId']." ) || (from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ))

UNION

select  DISTINCT new_tax_id from sync_tax_logs WHERE ((from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId']." ) || (from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ))

)

AND user_company_id!=".$data['toId']." and user_company_id=".$data['fromId'].""));
        
        for($i=0;$i<count($masterTaxData);$i++){
            $insert=[];
            $insert['name']=$masterTaxData[$i]->name;
            $insert['tax_value']=$masterTaxData[$i]->tax_value;
            $insert['user_company_id']=$data['toId'];
            $insert['created_by']=$data['toId'];
            $insert['updated_by']=$data['toId'];
            $insert['created_at']=date('Y-m-d H:i:s');
            $insert['updated_at']=date('Y-m-d H:i:s');
            
            $lastdata=DB::table('taxs')->insertGetId($insert);
            
            $insertSync=[];
            $insertSync['master_tax_id']=$masterTaxData[$i]->master_id;
            $insertSync['new_tax_id']=$lastdata;
            $insertSync['from_user_company_id']=$data['fromId'];
            $insertSync['to_user_company_id']=$data['toId'];
            $insertSync['created_by']=$data['toId'];
            $insertSync['updated_by']=$data['toId'];
            
            DB::table('sync_tax_logs')->insertGetId($insertSync);
        }
    }


    public static function syncProduct($data) {
  
        $productData = DB::select( DB::raw("SELECT *,id as master_id FROM products where id not in 

(
   select  DISTINCT master_product_id from sync_product_logs WHERE ((from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId']." ) || (from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ))
       
UNION

select  DISTINCT new_product_id from sync_product_logs WHERE ((from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ) || (from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId']." ))
       

)
AND user_company_id!=".$data['toId']." and user_company_id=".$data['fromId'].""));
        
       
        
        for($i=0;$i<count($productData);$i++){
           
             
             
            $catData = DB::select( DB::raw("SELECT * FROM `sync_product_cat_logs` where ((from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ) || (from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId'].") ) AND (master_product_cat_id=".$productData[$i]->category_id." || new_product_cat_id=".$productData[$i]->category_id.")"));
            
          
            $companyData = DB::select( DB::raw("SELECT * FROM `sync_product_company_logs` where ((from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ) || (from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId'].") ) AND (master_product_company_id=".$productData[$i]->company_id." || new_product_company_id=".$productData[$i]->company_id." )"));
            
            
            $taxData = DB::select( DB::raw("SELECT * FROM `sync_tax_logs` where ((from_user_company_id=".$data['fromId']." AND to_user_company_id=".$data['toId']." ) || (from_user_company_id=".$data['toId']." AND to_user_company_id=".$data['fromId'].") ) AND (master_tax_id=".$productData[$i]->tax_id."  || new_tax_id=".$productData[$i]->tax_id." ) "));
            
            if(!empty($catData) && !empty($companyData) && !empty($taxData)){
                if($catData[0]->master_product_cat_id==$productData[$i]->category_id){
                    $new_product_cat_id=$catData[0]->new_product_cat_id;
                }else if($catData[0]->new_product_cat_id==$productData[$i]->category_id){
                    $new_product_cat_id=$catData[0]->master_product_cat_id;
                    
                }
                
                if($companyData[0]->master_product_company_id==$productData[$i]->company_id){
                    $new_product_company_id=$companyData[0]->new_product_company_id;
                }else if($companyData[0]->new_product_company_id==$productData[$i]->company_id){
                    $new_product_company_id=$companyData[0]->master_product_company_id;
                    
                }
                
                if($taxData[0]->master_tax_id==$productData[$i]->tax_id){
                    
                    $new_tax_id=$taxData[0]->new_tax_id;
                    
                }else if($taxData[0]->new_tax_id==$productData[$i]->tax_id){
                    $new_tax_id=$taxData[0]->master_tax_id;
                    
                }
                
                $productInsert=[];
                $productInsert['name']=$productData[$i]->name;
                $productInsert['created_at']=date('Y-m-d H:i:s');
                $productInsert['updated_at']=date('Y-m-d H:i:s');
                $productInsert['category_id']=$new_product_cat_id;
                $productInsert['company_id']=$new_product_company_id;
                $productInsert['tax_id']=$new_tax_id;
                $productInsert['ean']=$productData[$i]->ean;
                $productInsert['sku']=$productData[$i]->sku;
                $productInsert['type']=$productData[$i]->type;
                $productInsert['sale_price']=$productData[$i]->sale_price;
                $productInsert['purchase_price']=$productData[$i]->purchase_price;
                $productInsert['user_company_id']=$data['toId'];
                $productInsert['created_by']=$data['toId'];
                $productInsert['updated_by']=$data['toId'];
               
                $lastdata=DB::table('products')->insertGetId($productInsert);
                
                $insertSync=[];
                $insertSync['master_product_id']=$productData[$i]->id;
                $insertSync['new_product_id']=$lastdata;
                $insertSync['from_user_company_id']=$data['fromId'];
                $insertSync['to_user_company_id']=$data['toId'];
                $insertSync['created_by']=$data['toId'];
                $insertSync['updated_by']=$data['toId'];

                DB::table('sync_product_logs')->insertGetId($insertSync);
                
            }
            
        }
       
    }
    
     public static function sync_list($params = array()) {
        $where="where id !=''";
       
        if (isset($params['search']) && !empty($params['search'])) {
             $where .=" and (email like '%".$params['search']."%' or is_allow like '%".$params['search']."%' )";
        }
        
        return DB::select( DB::raw(" SELECT q.* FROM ( SELECT sync_allows.id, users.email, 
(CASE WHEN is_allow_to_from =1 THEN 'No Action'  WHEN is_allow_to_from = 2 THEN 'Accept Request' WHEN is_allow_to_from = 3 THEN 'Reject Request'
END) as is_allow
FROM `sync_allows` inner JOIN users ON users.id= sync_allows.from_user_company_id WHERE to_user_company_id=".$params['user_company_id']." AND is_allow_to_from!=0

UNION 

SELECT sync_allows.id,users.email, (CASE
    WHEN is_allow_from_to =1 THEN 'No Action'  WHEN is_allow_from_to = 2 THEN 'Accept Request'  WHEN is_allow_from_to = 3 THEN 'Reject Request' END) as is_allow FROM `sync_allows` inner JOIN users ON users.id= sync_allows.to_user_company_id WHERE  from_user_company_id=".$params['user_company_id']." AND is_allow_from_to!=0 ) as q ".$where." order by {$params['sort_by']} {$params['sort_order']} limit {$params['start']},{$params['limit']} "));
       
    }


    public static function sync_listCount($params = array()) {
        
        $where="where id !=''";
        
        if (isset($params['search']) && !empty($params['search'])) {
            $where .=" and (email like '%".$params['search']."%' or is_allow like '%".$params['search']."%' )";
        }
        
        $totalcountQry = DB::select( DB::raw("SELECT count(id) as totalRecord  FROM ( SELECT sync_allows.id, users.email, 
(CASE WHEN is_allow_to_from =1 THEN 'No Action'  WHEN is_allow_to_from = 2 THEN 'Accept Request' WHEN is_allow_to_from = 3 THEN 'Reject Request'
END) as is_allow
FROM `sync_allows` inner JOIN users ON users.id= sync_allows.from_user_company_id WHERE to_user_company_id=".$params['user_company_id']." AND is_allow_to_from!=0

UNION 

SELECT sync_allows.id,users.email, (CASE
    WHEN is_allow_to_from =1 THEN 'No Action'  WHEN is_allow_to_from = 2 THEN 'Accept Request'  WHEN is_allow_to_from = 3 THEN 'Reject Request' END) as is_allow FROM `sync_allows` inner JOIN users ON users.id= sync_allows.to_user_company_id WHERE  from_user_company_id=".$params['user_company_id']." AND is_allow_from_to!=0) as q ".$where));
        return $totalcount = $totalcountQry[0]->totalRecord;
    }
}
