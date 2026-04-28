<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpgradeMenuManagementTables extends Migration
{
    public function up()
    {
        if (Schema::hasTable('menu')) {
            Schema::table('menu', function (Blueprint $table) {
                if (!Schema::hasColumn('menu', 'menu_key')) {
                    $table->string('menu_key')->nullable()->after('menu_title');
                }
                if (!Schema::hasColumn('menu', 'description')) {
                    $table->text('description')->nullable()->after('menu_position');
                }
                if (!Schema::hasColumn('menu', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('description');
                }
                if (!Schema::hasColumn('menu', 'created_by')) {
                    $table->unsignedBigInteger('created_by')->nullable()->after('is_active');
                }
                if (!Schema::hasColumn('menu', 'updated_by')) {
                    $table->unsignedBigInteger('updated_by')->nullable()->after('created_by');
                }
                if (!Schema::hasColumn('menu', 'updated_at')) {
                    $table->string('updated_at', 20)->nullable()->after('created_at');
                }
            });
        }

        if (Schema::hasTable('menu_structure')) {
            Schema::table('menu_structure', function (Blueprint $table) {
                if (!Schema::hasColumn('menu_structure', 'route_name')) {
                    $table->string('route_name')->nullable()->after('url');
                }
                if (!Schema::hasColumn('menu_structure', 'target')) {
                    $table->string('target')->nullable()->after('route_name');
                }
                if (!Schema::hasColumn('menu_structure', 'icon')) {
                    $table->string('icon')->nullable()->after('target');
                }
                if (!Schema::hasColumn('menu_structure', 'css_class')) {
                    $table->string('css_class')->nullable()->after('class');
                }
                if (!Schema::hasColumn('menu_structure', 'sort_order')) {
                    $table->integer('sort_order')->default(0)->after('target_blank');
                }
                if (!Schema::hasColumn('menu_structure', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('sort_order');
                }
                if (!Schema::hasColumn('menu_structure', 'open_in_new_tab')) {
                    $table->boolean('open_in_new_tab')->default(false)->after('is_active');
                }
                if (!Schema::hasColumn('menu_structure', 'permission_key')) {
                    $table->string('permission_key')->nullable()->after('open_in_new_tab');
                }
                if (!Schema::hasColumn('menu_structure', 'metadata')) {
                    $table->json('metadata')->nullable()->after('permission_key');
                }
                if (!Schema::hasColumn('menu_structure', 'updated_at')) {
                    $table->string('updated_at', 20)->nullable()->after('created_at');
                }
            });
        }
    }

    public function down()
    {
        // Keep legacy menu data intact.
    }
}
