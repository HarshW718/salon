<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateAllTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->integer('created_by')->after('name');
            $table->integer('updated_by')->after('created_by');
        });
        
        Schema::table('products_categories', function (Blueprint $table) {
            $table->integer('created_by')->after('name');
            $table->integer('updated_by')->after('created_by');
        });
        
        Schema::table('users', function (Blueprint $table) {
            $table->integer('created_by')->after('is_active');
            $table->integer('updated_by')->after('created_by');
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
