<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('products', function($table)
        {
            $table->string('name')->after('id');
            $table->integer('category_id');
            $table->integer('company_id');
            $table->integer('tax_id');
            $table->string('ean');
            $table->string('sku');
            $table->integer('stocke');
            $table->integer('min_stocke');
            $table->string('type');
            $table->float('sale_price',10,2);
            $table->float('purchase_price',10,2);
            $table->integer('created_by')->default(0);
            $table->integer('updated_by')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
