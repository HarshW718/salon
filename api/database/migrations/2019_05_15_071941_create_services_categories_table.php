<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateServicesCategoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('services_categories', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name')->comment('1=Machine, 2= Services');
            $table->tinyInteger('type');
            $table->string('color');
            $table->string('test');
            $table->integer('no_of_appoinment');
            $table->integer('created_by')->default(0);
            $table->integer('updated_by')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('services_categories');
    }
}
