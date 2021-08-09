<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateServicesCategoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('services_categories', function(Blueprint $table) {
            $table->renameColumn('no_of_appoinment', 'no_of_appointment');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('services_categories', function(Blueprint $table) {
            $table->renameColumn('no_of_appointment', 'no_of_appoinment');
        });
    }
}
