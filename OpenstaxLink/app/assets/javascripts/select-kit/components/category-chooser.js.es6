import ComboBoxComponent from "select-kit/components/combo-box";
import computed from "ember-addons/ember-computed-decorators";
import PermissionType from "discourse/models/permission-type";
import Category from "discourse/models/category";
import { categoryBadgeHTML } from "discourse/helpers/category-link";
const { get, isNone, isEmpty } = Ember;

export default ComboBoxComponent.extend({
  pluginApiIdentifiers: ["category-chooser"],
  classNames: "category-chooser",
  filterable: true,
  castInteger: true,
  allowUncategorized: false,
  rowComponent: "category-row",
  noneRowComponent: "none-category-row",
  allowSubCategories: true,
  permissionType: PermissionType.FULL,

  init() {
    this._super(...arguments);

    this.rowComponentOptions.setProperties({
      allowUncategorized: this.allowUncategorized
    });
  },

  filterComputedContent(computedContent, computedValue, filter) {
    if (isEmpty(filter)) {
      return computedContent;
    }

    if (this.scopedCategoryId) {
      computedContent = this.categoriesByScope(this.scopedCategoryId).map(c =>
        this.computeContentItem(c)
      );
    }

    const _matchFunction = (f, text) => {
      return this._normalize(text).indexOf(f) > -1;
    };

    return computedContent.filter(c => {
      const category = Category.findById(get(c, "value"));
      const text = get(c, "name");
      if (category && category.get("parentCategory")) {
        const categoryName = category.get("parentCategory.name");
        return (
          _matchFunction(filter, text) || _matchFunction(filter, categoryName)
        );
      } else {
        return _matchFunction(filter, text);
      }
    });
  },

  @computed("rootNone", "rootNoneLabel")
  none(rootNone, rootNoneLabel) {
    if (
      this.siteSettings.allow_uncategorized_topics ||
      this.allowUncategorized
    ) {
      if (!isNone(rootNone)) {
        return rootNoneLabel || "category.none";
      } else {
        return Category.findUncategorized();
      }
    } else {
      return "category.choose";
    }
  },

  computeHeaderContent() {
    let content = this._super(...arguments);

    if (this.hasSelection) {
      const category = Category.findById(content.value);
      const parentCategoryId = category.get("parent_category_id");
      const hasParentCategory = Ember.isPresent(parentCategoryId);

      let badge = "";

      if (hasParentCategory) {
        const parentCategory = Category.findById(parentCategoryId);
        badge += categoryBadgeHTML(parentCategory, {
          link: false,
          allowUncategorized: true
        }).htmlSafe();
      }

      badge += categoryBadgeHTML(category, {
        link: false,
        hideParent: hasParentCategory ? true : false,
        allowUncategorized: true
      }).htmlSafe();

      content.label = badge;
    }

    return content;
  },

  didSelect(computedContentItem) {
    if (this.attrs.onChooseCategory) {
      this.attrs.onChooseCategory(computedContentItem.originalContent);
    }
  },

  didClearSelection() {
    if (this.attrs.onChooseCategory) {
      this.attrs.onChooseCategory(null);
    }
  },

  computeContent() {
    return this.categoriesByScope(this.scopedCategoryId);
  },

  categoriesByScope(scopedCategoryId = null) {
    const categories = Discourse.SiteSettings.fixed_category_positions_on_create
      ? Category.list()
      : Category.listByActivity();

    if (scopedCategoryId) {
      const scopedCat = Category.findById(scopedCategoryId);
      scopedCategoryId =
        scopedCat.get("parent_category_id") || scopedCat.get("id");
    }

    const excludeCategoryId = this.excludeCategoryId;

    return categories.filter(c => {
      const categoryId = this.valueForContentItem(c);

      if (
        scopedCategoryId &&
        categoryId !== scopedCategoryId &&
        get(c, "parent_category_id") !== scopedCategoryId
      ) {
        return false;
      }

      if (this.allowSubCategories === false && c.get("parentCategory")) {
        return false;
      }

      if (
        (this.allowUncategorized === false &&
          get(c, "isUncategorizedCategory")) ||
        excludeCategoryId === categoryId
      ) {
        return false;
      }

      if (this.permissionType) {
        return this.permissionType === get(c, "permission");
      }

      return true;
    });
  }
});
