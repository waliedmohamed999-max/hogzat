<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Language;
use App\Models\Menu;
use App\Models\MenuStructure;
use App\Models\Option;
use App\Models\Page;
use App\Models\Post;
use App\Models\Seo;
use App\Models\Term;
use App\Models\TermRelation;
use App\Models\Taxonomy;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Sentinel;

class DashboardNativeController extends Controller
{
    public function postCommentsIndex(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $page = max(1, (int) $request->get('page', 1));
        $perPage = min(50, max(1, (int) $request->get('per_page', 20)));
        $result = (new Comment())->getAllComments([
            'type' => 'posts',
            'search' => $request->get('_s', ''),
            'page' => $page,
            'status' => $request->get('status', ''),
            'number' => $perPage,
        ]);

        $items = [];
        foreach ($result['results'] as $row) {
            $items[] = [
                'id' => (int) $row->comment_id,
                'title' => $row->comment_title ?? '',
                'content' => $row->comment_content ?? '',
                'author_name' => $row->comment_name ?? '',
                'author_email' => $row->comment_email ?? '',
                'status' => $row->status ?? 'pending',
                'post_id' => (int) ($row->post_id ?? 0),
                'post_title' => get_translate($row->post_title ?? '', 1),
                'post_slug' => $row->post_slug ?? '',
                'created_at' => !empty($row->created_at) ? date('Y-m-d', $row->created_at) : '',
                'public_url' => !empty($row->post_id) ? get_the_permalink((int) $row->post_id, $row->post_slug ?? '', '', 'post') : '',
            ];
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'total' => (int) $result['total'],
                'page' => $page,
                'per_page' => $perPage,
                'results' => $items,
            ],
        ]);
    }

    public function postCommentStatus(Request $request, $id)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $status = (string) $request->get('status', '');
        if (!in_array($status, ['publish', 'pending', 'trash'], true)) {
            return response()->json(['status' => 0, 'message' => __('Invalid status')], 422);
        }

        $updated = (new Comment())->updateStatus((int) $id, $status);
        return response()->json([
            'status' => $updated ? 1 : 0,
            'message' => $updated ? __('Updated Successfully') : __('Have error when saving'),
        ], $updated ? 200 : 422);
    }

    public function postCommentDelete($id)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $deleted = (new Comment())->deleteComment((int) $id);
        return response()->json([
            'status' => $deleted ? 1 : 0,
            'message' => $deleted ? __('Deleted successfully') : __('Can not delete this comment'),
        ], $deleted ? 200 : 422);
    }

    public function postTermsIndex(Request $request, $taxonomyName)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        if (!in_array($taxonomyName, ['post-category', 'post-tag'], true)) {
            return response()->json(['status' => 0, 'message' => __('Invalid taxonomy')], 422);
        }

        $page = max(1, (int) $request->get('page', 1));
        $perPage = min(50, max(1, (int) $request->get('per_page', 20)));
        $result = (new Term())->getAllTerms([
            'tax' => $taxonomyName,
            'search' => $request->get('_s', ''),
            'page' => $page,
            'number' => $perPage,
        ]);

        $items = [];
        foreach ($result['results'] as $row) {
            $items[] = [
                'id' => (int) $row->term_id,
                'title' => get_translate($row->term_title ?? '', 1),
                'slug' => $row->term_name ?? '',
                'description' => get_translate($row->term_description ?? '', 1),
                'image' => !empty($row->term_image) ? (get_attachment_url($row->term_image) ?: '') : '',
                'icon' => $row->term_icon ?? '',
                'price' => (float) ($row->term_price ?? 0),
                'taxonomy' => $taxonomyName,
            ];
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'taxonomy' => $taxonomyName,
                'total' => (int) $result['total'],
                'page' => $page,
                'per_page' => $perPage,
                'results' => $items,
            ],
        ]);
    }

    public function postTermSave(Request $request, $taxonomyName)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        if (!in_array($taxonomyName, ['post-category', 'post-tag'], true)) {
            return response()->json(['status' => 0, 'message' => __('Invalid taxonomy')], 422);
        }

        $title = trim((string) $request->get('title', ''));
        if ($title === '') {
            return response()->json(['status' => 0, 'message' => __('Term title is required')], 422);
        }

        $termId = (int) $request->get('id', 0);
        $taxonomy = (new Taxonomy())->getByName($taxonomyName);
        if (!$taxonomy) {
            return response()->json(['status' => 0, 'message' => __('Taxonomy is not available')], 404);
        }

        $payload = [
            'term_title' => $title,
            'term_name' => Str::slug((string) $request->get('slug', '')) ?: Str::slug($title),
            'term_description' => (string) $request->get('description', ''),
            'term_image' => (int) $request->get('image_id', 0),
            'term_icon' => (string) $request->get('icon', ''),
            'term_price' => (float) $request->get('price', 0),
        ];

        $termModel = new Term();
        if ($termId > 0) {
            $updated = $termModel->updateTerm($payload, $termId);
            return response()->json([
                'status' => $updated !== null ? 1 : 0,
                'message' => $updated !== null ? __('This term is updated') : __('Can not update this term'),
            ], $updated !== null ? 200 : 422);
        }

        $payload['taxonomy_id'] = (int) $taxonomy->taxonomy_id;
        $payload['created_at'] = time();
        $payload['author'] = get_current_user_id();
        $created = $termModel->createTerm($payload);

        return response()->json([
            'status' => $created ? 1 : 0,
            'message' => $created ? __('Created Successfully') : __('Can not create new term'),
            'data' => ['id' => (int) $created],
        ], $created ? 200 : 422);
    }

    public function postTermDelete($taxonomyName, $id)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        if (!in_array($taxonomyName, ['post-category', 'post-tag'], true)) {
            return response()->json(['status' => 0, 'message' => __('Invalid taxonomy')], 422);
        }

        $deleted = (new Term())->deleteTerm((int) $id);
        return response()->json([
            'status' => $deleted ? 1 : 0,
            'message' => $deleted ? __('Deleted successfully') : __('Can not delete this term'),
        ], $deleted ? 200 : 422);
    }

    public function postEditorNew()
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $id = (new Post())->createPost();
        return $this->postEditorShow($id);
    }

    public function postEditorShow($id)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $post = (new Post())->getById((int) $id);
        if (!$post || !user_can_edit_post($post)) {
            return response()->json(['status' => 0, 'message' => __('This post is invalid')], 404);
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'id' => (int) $post->post_id,
                'title' => get_translate($post->post_title, 1),
                'content' => get_translate($post->post_content ?? '', 1),
                'slug' => $post->post_slug ?? '',
                'status' => $post->status ?? 'draft',
                'thumbnail_id' => (int) ($post->thumbnail_id ?? 0),
                'thumbnail_url' => !empty($post->thumbnail_id) ? (get_attachment_url($post->thumbnail_id) ?: '') : '',
                'categories' => $this->mapEditorTerms('post-category', (int) $post->post_id),
                'tags' => $this->mapEditorTerms('post-tag', (int) $post->post_id),
            ],
        ]);
    }

    public function postEditorSave(Request $request, $id)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $post = (new Post())->getById((int) $id);
        if (!$post || !user_can_edit_post($post)) {
            return response()->json(['status' => 0, 'message' => __('This post is invalid')], 404);
        }

        $title = trim((string) $request->get('title', ''));
        if ($title === '') {
            return response()->json(['status' => 0, 'message' => __('Title is required')], 422);
        }

        $data = [
            'post_title' => $title,
            'post_content' => (string) $request->get('content', ''),
            'post_slug' => Str::slug((string) $request->get('slug', '')) ?: Str::slug($title),
            'thumbnail_id' => (int) $request->get('thumbnail_id', 0),
            'author' => (int) ($request->get('author', $post->author ?? get_current_user_id())),
            'status' => (string) $request->get('status', 'draft'),
        ];

        (new Post())->updatePost($data, (int) $id);

        $termRelation = new TermRelation();
        $termRelation->deleteRelationByServiceID((int) $id, 'post-category');
        foreach ((array) $request->get('categories', []) as $termID) {
            $termRelation->createRelation((int) $termID, (int) $id, 'post');
        }

        $termRelation->deleteRelationByServiceID((int) $id, 'post-tag');
        foreach ((array) $request->get('tags', []) as $termID) {
            $termRelation->createRelation((int) $termID, (int) $id, 'post');
        }

        return response()->json([
            'status' => 1,
            'message' => __('Updated Successfully'),
            'data' => [
                'id' => (int) $id,
                'public_url' => get_the_permalink((int) $id, $data['post_slug'], '', 'post'),
            ],
        ]);
    }

    public function pageEditorNew()
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $id = (new Page())->createPage();
        return $this->pageEditorShow($id);
    }

    public function pageEditorShow($id)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $page = (new Page())->getById((int) $id);
        if (!$page || !user_can_edit_post($page)) {
            return response()->json(['status' => 0, 'message' => __('This page is invalid')], 404);
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'id' => (int) $page->post_id,
                'title' => get_translate($page->post_title, 1),
                'content' => get_translate($page->post_content ?? '', 1),
                'slug' => $page->post_slug ?? '',
                'status' => $page->status ?? 'draft',
                'thumbnail_id' => (int) ($page->thumbnail_id ?? 0),
                'thumbnail_url' => !empty($page->thumbnail_id) ? (get_attachment_url($page->thumbnail_id) ?: '') : '',
                'page_template' => $page->page_template ?? 'default',
            ],
        ]);
    }

    public function pageEditorSave(Request $request, $id)
    {
        $user = Sentinel::getUser();
        if (!$user) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $page = (new Page())->getById((int) $id);
        if (!$page || !user_can_edit_post($page)) {
            return response()->json(['status' => 0, 'message' => __('This page is invalid')], 404);
        }

        $title = trim((string) $request->get('title', ''));
        if ($title === '') {
            return response()->json(['status' => 0, 'message' => __('Title is required')], 422);
        }

        $data = [
            'post_title' => $title,
            'post_content' => (string) $request->get('content', ''),
            'post_slug' => Str::slug((string) $request->get('slug', '')) ?: Str::slug($title),
            'thumbnail_id' => (int) $request->get('thumbnail_id', 0),
            'page_template' => (string) $request->get('page_template', 'default'),
            'status' => (string) $request->get('status', 'draft'),
        ];

        (new Page())->updatePage($data, (int) $id);

        return response()->json([
            'status' => 1,
            'message' => __('Updated Successfully'),
            'data' => [
                'id' => (int) $id,
                'public_url' => get_the_permalink((int) $id, $data['post_slug'], '', 'page'),
            ],
        ]);
    }

    private function systemSettingKeys()
    {
        return [
            'site_title',
            'site_description',
            'admin_email',
            'contact_phone',
            'contact_email',
            'contact_address',
            'dashboard_logo',
            'dashboard_logo_short',
            'site_language',
            'brand_name_ar',
            'brand_name_en',
            'brand_logo_url',
            'brand_logo_short_url',
            'public_hero_eyebrow',
            'public_hero_title',
            'public_hero_subtitle',
            'footer_tagline',
            'footer_description',
            'footer_sections_title',
            'footer_account_title',
            'footer_newsletter_title',
            'footer_newsletter_text',
        ];
    }

    private function systemSettingsPayload()
    {
        $data = [];
        foreach ($this->systemSettingKeys() as $key) {
            $data[$key] = get_opt($key, '');
        }

        return $data;
    }

    public function publicSettings()
    {
        return response()->json(['status' => 1, 'data' => $this->systemSettingsPayload()]);
    }

    public function settingsShow()
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        return response()->json(['status' => 1, 'data' => $this->systemSettingsPayload()]);
    }

    public function settingsSave(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        foreach ($this->systemSettingKeys() as $key) {
            update_opt($key, (string) $request->get($key, ''));
        }

        return response()->json(['status' => 1, 'message' => __('Updated Successfully')]);
    }

    public function menusIndex(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        return response()->json([
            'status' => 1,
            'data' => $this->menuPayload(false),
            'meta' => [
                'locations' => $this->menuLocations(),
                'permissions' => $this->menuPermissions(),
            ],
        ]);
    }

    public function menuSave(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $menuId = (int)$request->get('id', 0);
        $title = trim((string)$request->get('title', ''));
        if ($title === '') {
            return response()->json(['status' => 0, 'message' => __('Please create new menu before doing it')], 422);
        }

        $position = Str::slug((string)$request->get('position', ''), '-');
        $key = Str::slug((string)$request->get('key', ''), '-');
        if ($key === '') {
            $key = Str::slug($title, '-');
        }
        if ($position === '') {
            $position = $key ?: 'custom';
        }

        $items = (array)$request->get('items', []);
        foreach ($items as $index => $item) {
            $itemName = trim((string)($item['name'] ?? ''));
            $type = (string)($item['type'] ?? 'custom');
            $url = trim((string)($item['url'] ?? ''));
            if ($itemName === '') {
                return response()->json(['status' => 0, 'message' => __('Menu item title is required') . ' #' . ($index + 1)], 422);
            }
            if (!in_array($type, ['internal', 'external', 'anchor', 'dropdown', 'custom', 'page', 'post', 'category'], true)) {
                return response()->json(['status' => 0, 'message' => __('Invalid menu item type')], 422);
            }
            if ($type !== 'dropdown' && $url === '' && empty($item['route_name'])) {
                return response()->json(['status' => 0, 'message' => __('Menu item URL is required') . ' #' . ($index + 1)], 422);
            }
        }

        $savedId = DB::transaction(function () use ($request, $user, $menuId, $title, $key, $position, $items) {
            $now = (string)time();
            $menuModel = new Menu();
            $structureModel = new MenuStructure();

            if ($position !== '') {
                DB::table('menu')
                    ->where('menu_position', $position)
                    ->when($menuId > 0, fn($query) => $query->where('menu_id', '<>', $menuId))
                    ->update(['menu_position' => '']);
            }

            $menuData = [
                'menu_title' => $title,
                'menu_position' => $position,
            ];
            $this->setColumn($menuData, 'menu', 'menu_key', $key);
            $this->setColumn($menuData, 'menu', 'description', (string)$request->get('description', ''));
            $this->setColumn($menuData, 'menu', 'is_active', (int)$request->boolean('is_active', true));
            $this->setColumn($menuData, 'menu', 'updated_by', $user->id);
            $this->setColumn($menuData, 'menu', 'updated_at', $now);

            if ($menuId > 0) {
                $menuModel->updateMenu($menuId, $menuData);
            } else {
                $this->setColumn($menuData, 'menu', 'created_by', $user->id);
                $menuData['created_at'] = $now;
                $menuId = $menuModel->createMenu($menuData);
            }

            $structureModel->resetMenuStructure($menuId);
            foreach ($items as $index => $item) {
                $itemId = (int)($item['item_id'] ?? 0);
                if ($itemId <= 0) {
                    $itemId = $index + 1;
                }
                $targetBlank = !empty($item['target_blank']) || !empty($item['open_in_new_tab']) ? 1 : 0;
                $payload = [
                    'item_id' => $itemId,
                    'parent_id' => (int)($item['parent_id'] ?? 0),
                    'depth' => (int)($item['depth'] ?? 0),
                    'left' => (int)($item['left'] ?? 0),
                    'right' => (int)($item['right'] ?? 0),
                    'name' => (string)($item['name'] ?? ''),
                    'type' => (string)($item['type'] ?? 'custom'),
                    'post_id' => (int)($item['post_id'] ?? 0),
                    'post_title' => (string)($item['post_title'] ?? ''),
                    'url' => (string)($item['url'] ?? ''),
                    'class' => (string)($item['class'] ?? ''),
                    'menu_id' => $menuId,
                    'menu_lang' => get_current_language(),
                    'target_blank' => $targetBlank,
                    'created_at' => $now,
                ];
                $this->setColumn($payload, 'menu_structure', 'route_name', (string)($item['route_name'] ?? ''));
                $this->setColumn($payload, 'menu_structure', 'target', $targetBlank ? '_blank' : '_self');
                $this->setColumn($payload, 'menu_structure', 'icon', (string)($item['icon'] ?? ''));
                $this->setColumn($payload, 'menu_structure', 'css_class', (string)($item['css_class'] ?? $item['class'] ?? ''));
                $this->setColumn($payload, 'menu_structure', 'sort_order', (int)($item['sort_order'] ?? $index));
                $this->setColumn($payload, 'menu_structure', 'is_active', (int)($item['is_active'] ?? 1));
                $this->setColumn($payload, 'menu_structure', 'open_in_new_tab', $targetBlank);
                $this->setColumn($payload, 'menu_structure', 'permission_key', (string)($item['permission_key'] ?? ''));
                $this->setColumn($payload, 'menu_structure', 'metadata', json_encode((array)($item['metadata'] ?? [])));
                $this->setColumn($payload, 'menu_structure', 'updated_at', $now);
                $structureModel->createMenuItem($payload);
            }

            return $menuId;
        });

        $this->clearMenuCache();
        \Log::info('Menu saved', ['menu_id' => $savedId, 'user_id' => $user->id]);

        return response()->json(['status' => 1, 'message' => __('Updated menu successfully'), 'data' => ['id' => $savedId]]);
    }

    public function menuDelete($id)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $menu = new Menu();
        $menuStructure = new MenuStructure();
        $menuObject = $menu->getById((int) $id);
        if (!$menuObject) {
            return response()->json(['status' => 0, 'message' => __('This menu is invalid')], 404);
        }

        DB::transaction(function () use ($menu, $menuStructure, $id) {
            $menu->deleteMenu((int)$id);
            $menuStructure->deleteItemByMenuId((int)$id);
        });

        $this->clearMenuCache();
        \Log::warning('Menu deleted', ['menu_id' => (int)$id, 'user_id' => $user->id]);

        return response()->json(['status' => 1, 'message' => __('This Menu is deleted')]);
    }

    public function publicMenus(Request $request)
    {
        $location = $request->get('location', 'primary');
        $menus = Cache::remember('public_menu_' . $location . '_' . get_current_language(), 3600, function () use ($location) {
            return collect($this->menuPayload(true, $location))->values();
        });

        return response()->json(['status' => 1, 'data' => $menus]);
    }

    private function menuPayload(bool $activeOnly = false, ?string $location = null): array
    {
        $menuModel = new Menu();
        $structureModel = new MenuStructure();
        $menus = [];

        foreach (($menuModel->getAllMenus(['active_only' => $activeOnly, 'location' => $location]) ?: []) as $menu) {
            $items = [];
            $sourceItems = $activeOnly ? $structureModel->getByMenuId($menu->menu_id) : $structureModel->getAdminByMenuId($menu->menu_id);
            foreach (($sourceItems ?: []) as $item) {
                $metadata = [];
                if (!empty($item->metadata)) {
                    $decoded = json_decode((string)$item->metadata, true);
                    $metadata = is_array($decoded) ? $decoded : [];
                }
                $items[] = [
                    'item_id' => (int)$item->item_id,
                    'parent_id' => (int)($item->parent_id ?? 0),
                    'depth' => (int)($item->depth ?? 0),
                    'name' => $item->name ?? '',
                    'type' => $item->type ?? 'custom',
                    'post_id' => (int)($item->post_id ?? 0),
                    'post_title' => $item->post_title ?? '',
                    'url' => $item->url ?? '',
                    'route_name' => $item->route_name ?? '',
                    'target' => $item->target ?? (!empty($item->target_blank) ? '_blank' : '_self'),
                    'icon' => $item->icon ?? '',
                    'class' => $item->class ?? '',
                    'css_class' => $item->css_class ?? ($item->class ?? ''),
                    'sort_order' => (int)($item->sort_order ?? 0),
                    'is_active' => (int)($item->is_active ?? 1),
                    'target_blank' => (int)($item->target_blank ?? 0),
                    'open_in_new_tab' => (int)($item->open_in_new_tab ?? $item->target_blank ?? 0),
                    'permission_key' => $item->permission_key ?? '',
                    'metadata' => $metadata,
                ];
            }

            $menus[] = [
                'id' => (int)$menu->menu_id,
                'title' => $menu->menu_title ?? '',
                'key' => $menu->menu_key ?? Str::slug($menu->menu_title ?? 'menu-' . $menu->menu_id),
                'position' => $menu->menu_position ?? '',
                'description' => $menu->description ?? '',
                'is_active' => (int)($menu->is_active ?? 1),
                'items' => $items,
            ];
        }

        return $menus;
    }

    private function menuLocations(): array
    {
        return [
            ['key' => 'primary', 'label' => 'Primary'],
            ['key' => 'header', 'label' => 'Header'],
            ['key' => 'footer', 'label' => 'Footer'],
            ['key' => 'sidebar', 'label' => 'Sidebar'],
            ['key' => 'mobile-menu', 'label' => 'Mobile Menu'],
            ['key' => 'hero-quick-links', 'label' => 'Hero Quick Links'],
            ['key' => 'home-categories', 'label' => 'Homepage Categories'],
            ['key' => 'app-promo-links', 'label' => 'App Promo Links'],
            ['key' => 'platform-features', 'label' => 'Platform Features'],
        ];
    }

    private function menuPermissions(): array
    {
        return [
            'view menus' => true,
            'create menus' => true,
            'edit menus' => true,
            'delete menus' => true,
            'reorder menus' => true,
            'manage menu items' => true,
            'publish menus' => true,
            'manage menu locations' => true,
        ];
    }

    private function setColumn(array &$payload, string $table, string $column, $value): void
    {
        if (Schema::hasColumn($table, $column)) {
            $payload[$column] = $value;
        }
    }

    private function clearMenuCache(): void
    {
        Cache::flush();
    }

    public function messagesMeta(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $users = [];
        foreach (User::query()->orderByDesc('id')->limit(200)->get() as $row) {
            $users[] = [
                'id' => (int) $row->id,
                'name' => trim(($row->first_name ?? '') . ' ' . ($row->last_name ?? '')),
                'mobile' => $row->mobile ?? '',
                'email' => $row->email ?? '',
            ];
        }

        return response()->json(['status' => 1, 'data' => ['users' => $users]]);
    }

    public function messagesSendAll(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $message = trim((string) $request->get('message', ''));
        if ($message === '') {
            return response()->json(['status' => 0, 'message' => __('Message is required')], 422);
        }

        $numbers = User::query()->whereNotNull('mobile')->pluck('mobile')->filter()->implode(',');
        $response = $this->sendSms($numbers, $message);

        return response()->json($response, ($response['status'] ?? 0) ? 200 : 422);
    }

    public function messagesSendSpecific(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $mobile = trim((string) $request->get('mobile', ''));
        $message = trim((string) $request->get('message', ''));
        if ($mobile === '' || $message === '') {
            return response()->json(['status' => 0, 'message' => __('Mobile and message are required')], 422);
        }

        $response = $this->sendSms($mobile, $message);
        return response()->json($response, ($response['status'] ?? 0) ? 200 : 422);
    }

    public function languagesIndex(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $page = max(1, (int) $request->get('page', 1));
        $perPage = min(50, max(1, (int) $request->get('per_page', 20)));
        $result = (new Language())->getAllLanguages([
            'search' => $request->get('_s', ''),
            'page' => $page,
            'number' => $perPage,
            'status' => $request->get('status', ''),
        ]);

        $items = [];
        foreach ($result['results'] as $row) {
            $items[] = [
                'id' => (int) $row->id,
                'code' => $row->code,
                'name' => $row->name,
                'flag_name' => $row->flag_name ?? '',
                'flag_code' => $row->flag_code ?? '',
                'status' => $row->status ?? 'off',
                'rtl' => $row->rtl ?? 'no',
                'priority' => (int) ($row->priority ?? 0),
            ];
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'total' => (int) $result['total'],
                'page' => $page,
                'per_page' => $perPage,
                'catalog' => config('locales.languages'),
                'results' => $items,
            ],
        ]);
    }

    public function languageSave(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $id = (int) $request->get('id', 0);
        $code = (string) $request->get('code', '');
        $name = (string) $request->get('name', '');
        $flagName = (string) $request->get('flag_name', '');
        if ($code === '' || $name === '' || $flagName === '') {
            return response()->json(['status' => 0, 'message' => __('Language, name and flag are required')], 422);
        }

        $payload = [
            'code' => $code,
            'name' => $name,
            'flag_name' => $flagName,
            'flag_code' => (string) $request->get('flag_code', ''),
            'status' => (string) $request->get('status', 'off'),
            'rtl' => (string) $request->get('rtl', 'no'),
        ];

        if ($id > 0) {
            (new Language())->updateLanguage($payload, $id);
        } else {
            $language = new Language();
            foreach ($payload as $key => $value) {
                $language->{$key} = $value;
            }
            $language->save();
            $id = (int) $language->id;
        }

        return response()->json(['status' => 1, 'message' => __('Updated language successfully'), 'data' => ['id' => $id]]);
    }

    public function languageStatus(Request $request, $id)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $status = (string) $request->get('status', 'off');
        (new Language())->updateLanguage(['status' => $status], (int) $id);
        return response()->json(['status' => 1, 'message' => __('Updated Successfully')]);
    }

    public function languageDelete($id)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        (new Language())->deleteLanguage((int) $id);
        return response()->json(['status' => 1, 'message' => __('This language is deleted')]);
    }

    public function languageOrder(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        foreach ((array) $request->get('data', []) as $key => $val) {
            Language::where('code', $key)->update(['priority' => $val]);
        }

        return response()->json(['status' => 1, 'message' => __('Update successfully')]);
    }

    public function translationIndex(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $langs = config('locales.languages');
        $lang = $request->get('lang', 'none');
        $siteLanguage = get_option('site_language', 'none');
        if ($siteLanguage !== 'none' && $lang === 'none') {
            $lang = $siteLanguage;
        }

        $strings = $this->readTranslationSource(resource_path('lang/awe.lang'), false);
        $translation = ($lang !== 'none' && isset($langs[$lang]))
            ? $this->readTranslationSource(resource_path("lang/{$lang}.json"), true)
            : [];

        return response()->json([
            'status' => 1,
            'data' => [
                'langs' => $langs,
                'lang' => $lang,
                'strings' => $strings,
                'translation' => $translation,
            ],
        ]);
    }

    public function translationSave(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $lang = (string) $request->get('lang', 'none');
        $values = (array) $request->get('values', []);
        if ($lang === 'none' || empty(config('locales.languages')[$lang])) {
            return response()->json(['status' => 0, 'message' => __('Please choose language before translating')], 422);
        }

        File::put(resource_path("lang/{$lang}.json"), json_encode($values, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return response()->json(['status' => 1, 'message' => __('Translated successfully')]);
    }

    public function seoIndex()
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $pages = config('awebooking.pages_name');
        $items = [];
        foreach ($pages as $name => $page) {
            if (isset($page['seo_page']) && !$page['seo_page']) {
                continue;
            }

            $seoValue = get_seo_item_by_post_id($page['screen'], 'seo_page');
            $items[] = [
                'key' => $name,
                'screen' => $page['screen'],
                'name' => $page['seo_name'] ?? $name,
                'seo_title' => $seoValue->seo_title ?? '',
                'seo_description' => $seoValue->seo_description ?? '',
                'facebook_title' => $seoValue->facebook_title ?? '',
                'facebook_description' => $seoValue->facebook_description ?? '',
                'facebook_image' => (int) ($seoValue->facebook_image ?? 0),
                'twitter_title' => $seoValue->twitter_title ?? '',
                'twitter_description' => $seoValue->twitter_description ?? '',
                'twitter_image' => (int) ($seoValue->twitter_image ?? 0),
            ];
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'enabled' => get_option('enable_seo', 'off') === 'on',
                'pages' => $items,
            ],
        ]);
    }

    public function seoSave(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $pages = (array) $request->get('pages', []);
        $seo = new Seo();
        foreach ($pages as $item) {
            $screen = (string) ($item['screen'] ?? '');
            if ($screen === '') {
                continue;
            }

            $seoData = [
                'post_id' => $screen,
                'post_type' => 'seo_page',
                'created_at' => time(),
                'seo_title' => (string) ($item['seo_title'] ?? ''),
                'seo_description' => (string) ($item['seo_description'] ?? ''),
                'facebook_title' => (string) ($item['facebook_title'] ?? ''),
                'facebook_description' => (string) ($item['facebook_description'] ?? ''),
                'facebook_image' => (int) ($item['facebook_image'] ?? 0),
                'twitter_title' => (string) ($item['twitter_title'] ?? ''),
                'twitter_description' => (string) ($item['twitter_description'] ?? ''),
                'twitter_image' => (int) ($item['twitter_image'] ?? 0),
            ];

            $seoItem = $seo->getByPostId($screen, 'seo_page');
            if (is_null($seoItem)) {
                $seo->createSeo($seoData);
            } else {
                $seo->updateSeo($seoData, $seoItem->seo_id);
            }
        }

        return response()->json(['status' => 1, 'message' => __('Updated SEO Pages successfully')]);
    }

    public function apiSettingsShow()
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $userId = get_current_user_id();
        $token = get_user_meta($userId, 'access_token');
        if (empty($token)) {
            $token = create_api_token($userId);
            update_user_meta($userId, 'access_token', $token);
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'access_token' => $token,
                'api_lifetime' => (string) get_opt('api_lifetime', 30),
                'api_lifetime_type' => (string) get_opt('api_lifetime_type', 'day'),
            ],
        ]);
    }

    public function apiSettingsSave(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        update_opt('api_lifetime', (string) $request->get('api_lifetime', 30));
        update_opt('api_lifetime_type', (string) $request->get('api_lifetime_type', 'day'));

        return response()->json(['status' => 1, 'message' => __('Successfully Updated')]);
    }

    public function toolsIndex()
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'password_required' => !empty(env('SYSTEM_PASSWORD')),
                'tools' => [
                    ['value' => 'clear_cache', 'label' => __('Clear cache and compiled assets')],
                    ['value' => 'clear_view', 'label' => __('Clear views only')],
                    ['value' => 'update_version', 'label' => __('Run version migrations')],
                    ['value' => 'symlink', 'label' => __('Recreate storage links')],
                    ['value' => 'maintenance_on', 'label' => __('Enable maintenance mode')],
                    ['value' => 'maintenance_off', 'label' => __('Disable maintenance mode')],
                ],
            ],
        ]);
    }

    public function toolsExecute(Request $request)
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $action = (string) $request->get('system_tool', '');
        $password = (string) $request->get('password', '');
        $systemPassword = env('SYSTEM_PASSWORD');
        if (!empty($systemPassword) && $systemPassword !== $password) {
            return response()->json(['status' => 0, 'message' => __('Can not access this action. Please check the password.')], 422);
        }

        $messages = [];
        switch ($action) {
            case 'clear_cache':
                Artisan::call('cache:clear');
                $messages[] = trim(Artisan::output());
                Artisan::call('view:clear');
                $messages[] = trim(Artisan::output());
                Artisan::call('route:clear');
                $messages[] = trim(Artisan::output());
                File::deleteDirectory(public_path('caching'));
                $messages[] = __('Deleted scripts cache');
                break;
            case 'clear_view':
                Artisan::call('view:clear');
                $messages[] = trim(Artisan::output());
                break;
            case 'update_version':
                Artisan::call('migrate');
                $messages[] = trim(Artisan::output());
                break;
            case 'symlink':
                Artisan::call('extension:link');
                $messages[] = trim(Artisan::output());
                Artisan::call('awe:link');
                $messages[] = trim(Artisan::output());
                Artisan::call('storage:link');
                $messages[] = trim(Artisan::output());
                break;
            case 'maintenance_on':
                Artisan::call('down');
                $messages[] = trim(Artisan::output()) ?: __('Application is now in maintenance mode');
                break;
            case 'maintenance_off':
                Artisan::call('up');
                $messages[] = trim(Artisan::output()) ?: __('Application is now live');
                break;
            default:
                return response()->json(['status' => 0, 'message' => __('Can not access this action')], 422);
        }

        return response()->json([
            'status' => 1,
            'message' => __('Action executed successfully'),
            'data' => [
                'logs' => array_values(array_filter($messages)),
            ],
        ]);
    }

    public function translationScan()
    {
        $user = Sentinel::getUser();
        if (!$user || !is_admin()) {
            return response()->json(['status' => 0, 'message' => 'Unauthorized'], 401);
        }

        $strings = $this->scanAllTranslateText([]);
        if (empty($strings)) {
            return response()->json(['status' => 0, 'message' => __('No text translation')], 422);
        }

        File::put(resource_path('lang/awe.lang'), implode("\r\n", $strings));
        return response()->json(['status' => 1, 'message' => __('Scan successfully')]);
    }

    private function mapEditorTerms($taxonomy, $postId)
    {
        $all = [];
        foreach ((new Term())->getAllTerms([
            'tax' => $taxonomy,
            'number' => -1,
        ])['results'] as $term) {
            $all[] = [
                'id' => (int) $term->term_id,
                'title' => get_translate($term->term_title, 1),
            ];
        }

        $selected = [];
        foreach ((new Term())->getTheTerms($postId, $taxonomy) ?: [] as $term) {
            $selected[] = (int) $term->term_id;
        }

        return [
            'available' => $all,
            'selected' => $selected,
        ];
    }

    private function sendSms($numbers, $message)
    {
        $response = Http::post('https://www.msegat.com/gw/sendsms.php', [
            'userName' => 'لبية',
            'numbers' => $numbers,
            'userSender' => 'Labayh',
            'apiKey' => '2e02b50ebe8e11e93c532c0b1b5cbdcf',
            'msg' => $message,
        ]);

        $json = $response->json();
        if (($json['code'] ?? 0) == 1) {
            return ['status' => 1, 'message' => __('Message Send successfully')];
        }

        return ['status' => 0, 'message' => __('Message Not Sended!')];
    }

    private function readTranslationSource($path, $json = false)
    {
        if (!file_exists($path)) {
            return [];
        }

        $content = trim(file_get_contents($path));
        if ($content === '') {
            return [];
        }

        if ($json) {
            return json_decode($content, true) ?: [];
        }

        return preg_split("/\r\n|\n|\r/", $content) ?: [];
    }

    private function scanAllTranslateText($strings)
    {
        $folders = [app_path()];
        foreach ($folders as $folder) {
            foreach ($this->scanAllFiles($folder) as $file) {
                if (!file_exists($file)) {
                    continue;
                }
                $content = file_get_contents($file);
                preg_match_all("/_n\( \"(.*)\",|_n\(\"(.*)\",|_n\(\"(.*)\"\)|_n\( \"(.*)\" \)|_n\( '(.*)' \)|_n\('(.*)'\)|__\('(.*)'\)|__\( '(.*)' \)|__\('(.*)',|__\(\"(.*)\",|__\(\"(.*)\"\)|trans\('(.*)'\)|trans\(\"(.*)\"\)|trans_choice\('(.*)'\)|trans_choice\(\"(.*)\"\)|awe_lang\('(.*)'\)|awe_lang\(\"(.*)\"\)/U", $content, $output, PREG_PATTERN_ORDER);
                for ($i = 1; $i <= 18; $i++) {
                    if (!isset($output[$i])) {
                        continue;
                    }
                    foreach ($output[$i] as $v) {
                        $v = trim($v);
                        if ($v !== '' && !in_array($v, $strings, true)) {
                            $strings[] = $v;
                        }
                    }
                }
            }
        }
        return $strings;
    }

    private function scanAllFiles($dir)
    {
        $root = scandir($dir);
        $result = [];
        foreach ($root as $value) {
            if ($value === '.' || $value === '..') {
                continue;
            }
            $path = "{$dir}/{$value}";
            if (is_file($path)) {
                $result[] = $path;
                continue;
            }
            foreach ($this->scanAllFiles($path) as $nested) {
                $result[] = $nested;
            }
        }
        return $result;
    }
}
