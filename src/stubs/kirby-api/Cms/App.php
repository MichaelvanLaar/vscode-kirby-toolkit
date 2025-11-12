<?php

/**
 * Kirby App Class Stub
 *
 * This is a stub file for IntelliSense support. It contains method signatures
 * and PHPDoc annotations but no actual implementation.
 *
 * @version Kirby 4.0
 * @link https://getkirby.com/docs/reference/objects/cms/app
 */

namespace Kirby\Cms;

/**
 * The App class is the main Kirby instance.
 *
 * @link https://getkirby.com/docs/reference/objects/cms/app
 */
class App
{
    /**
     * Returns the Site object
     *
     * @return \Kirby\Cms\Site
     * @link https://getkirby.com/docs/reference/objects/cms/app/site
     */
    public function site()
    {
    }

    /**
     * Returns a collection of all users
     *
     * @return \Kirby\Cms\Users
     * @link https://getkirby.com/docs/reference/objects/cms/app/users
     */
    public function users()
    {
    }

    /**
     * Returns a specific user by ID or email
     *
     * @param string|null $id
     * @return \Kirby\Cms\User|null
     * @link https://getkirby.com/docs/reference/objects/cms/app/user
     */
    public function user(?string $id = null)
    {
    }

    /**
     * Returns the current user
     *
     * @return \Kirby\Cms\User|null
     * @link https://getkirby.com/docs/reference/objects/cms/app/user
     */
    public function user()
    {
    }

    /**
     * Returns a specific page by ID
     *
     * @param string $id
     * @return \Kirby\Cms\Page|null
     * @link https://getkirby.com/docs/reference/objects/cms/app/page
     */
    public function page(string $id)
    {
    }

    /**
     * Returns a collection of all pages
     *
     * @return \Kirby\Cms\Pages
     * @link https://getkirby.com/docs/reference/objects/cms/app/pages
     */
    public function pages()
    {
    }

    /**
     * Returns a specific file by ID
     *
     * @param string $id
     * @return \Kirby\Cms\File|null
     * @link https://getkirby.com/docs/reference/objects/cms/app/file
     */
    public function file(string $id)
    {
    }

    /**
     * Returns a configuration option value
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     * @link https://getkirby.com/docs/reference/objects/cms/app/option
     */
    public function option(string $key, $default = null)
    {
    }

    /**
     * Returns all configuration options
     *
     * @return array
     * @link https://getkirby.com/docs/reference/objects/cms/app/options
     */
    public function options(): array
    {
    }

    /**
     * Returns the roots array
     *
     * @return \Kirby\Cms\Ingredients\Roots
     * @link https://getkirby.com/docs/reference/objects/cms/app/roots
     */
    public function roots()
    {
    }

    /**
     * Returns a specific root path
     *
     * @param string $key
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/app/root
     */
    public function root(string $key = 'index'): string
    {
    }

    /**
     * Returns the URLs array
     *
     * @return \Kirby\Cms\Ingredients\Urls
     * @link https://getkirby.com/docs/reference/objects/cms/app/urls
     */
    public function urls()
    {
    }

    /**
     * Returns a specific URL
     *
     * @param string $key
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/app/url
     */
    public function url(string $key = 'index'): string
    {
    }

    /**
     * Returns the current request object
     *
     * @return \Kirby\Http\Request
     * @link https://getkirby.com/docs/reference/objects/cms/app/request
     */
    public function request()
    {
    }

    /**
     * Returns the session object
     *
     * @return \Kirby\Session\Session
     * @link https://getkirby.com/docs/reference/objects/cms/app/session
     */
    public function session()
    {
    }

    /**
     * Returns the multilanguage support status
     *
     * @return bool
     * @link https://getkirby.com/docs/reference/objects/cms/app/multilang
     */
    public function multilang(): bool
    {
    }

    /**
     * Returns a collection of all languages
     *
     * @return \Kirby\Cms\Languages
     * @link https://getkirby.com/docs/reference/objects/cms/app/languages
     */
    public function languages()
    {
    }

    /**
     * Returns the current language
     *
     * @return \Kirby\Cms\Language|null
     * @link https://getkirby.com/docs/reference/objects/cms/app/language
     */
    public function language()
    {
    }

    /**
     * Returns the default language
     *
     * @return \Kirby\Cms\Language|null
     * @link https://getkirby.com/docs/reference/objects/cms/app/default-language
     */
    public function defaultLanguage()
    {
    }

    /**
     * Returns a collection of all roles
     *
     * @return \Kirby\Cms\Roles
     * @link https://getkirby.com/docs/reference/objects/cms/app/roles
     */
    public function roles()
    {
    }

    /**
     * Returns the Kirby version
     *
     * @return string
     * @link https://getkirby.com/docs/reference/objects/cms/app/version
     */
    public function version(): string
    {
    }

    /**
     * Renders a template or snippet
     *
     * @param string $template
     * @param array $data
     * @param bool $return
     * @return string|null
     * @link https://getkirby.com/docs/reference/objects/cms/app/render
     */
    public function render(string $template, array $data = [], bool $return = true): ?string
    {
    }

    /**
     * Returns a collection
     *
     * @param string $name
     * @return \Kirby\Cms\Collection|null
     * @link https://getkirby.com/docs/reference/objects/cms/app/collection
     */
    public function collection(string $name)
    {
    }
}
