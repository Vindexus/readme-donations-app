var endpoint = 'http://localhost:4700/'
var DEFAULT_NANO_ADDRESS = 'xrb_3cgfmkm9db8m7536unou3ji5syemx5oaj89sm3dgm5jamopkjmzwr5tmtq7o'

function getTemplate (name) {
  var el = document.querySelector('script[template="' + name + '"]')

  if (el) {
    return '<span>' + el.innerHTML + '</span>'
  }

  return ''
}

document.addEventListener('DOMContentLoaded', function () {
  const routes = [
    {
      path: '/',
      component: {
        template: getTemplate('page-pick-repo'),
        data: function () {
          return {
            owner: '',
            repo: '',
            errors: []
          }
        },
        methods: {
          submit: function (e) {
            e.preventDefault()
            this.errors = []
            this.owner = this.owner.trim()
            this.repo = this.repo.trim()

            if (!this.owner) {
              this.errors.push('owner is required')
            }

            if (!this.repo) {
              this.errors.push('Repo is required')
            }

            if (this.errors.length) {
              return
            }

            this.owner = this.owner.toLowerCase()
            this.repo = this.repo.toLowerCase()

            router.push(this.owner + '/' + this.repo)
          }
        }
      }
    }, {
      path: '/:owner/:repo',
      component: {
        template: getTemplate('page-donate'),
        created: function () {
            this.fetchData()
            this.fetchCurrencies()
        },
        watch: {
          '$route': 'fetchData'
        },
        methods: {
          fetchData: function () {
            this.loading = true
            this.repoEndpoint = endpoint + 'repos/' + this.$route.params.owner + '/' + this.$route.params.repo
            // replace `getPost` with your data fetching util / API wrapper
            $.getJSON(this.repoEndpoint + '.json', (data) => {
              this.loading = false
              this.readme = data.readme
              this.github = data.github
            })
          },
          fetchCurrencies: function () {
            var url = endpoint + 'currencies'
            // replace `getPost` with your data fetching util / API wrapper
            $.getJSON(url, function (data) {
              this.currencies = Object.keys(data).map((key) => {
                return data[key]
              })
              console.log('this.currencies',this.currencies);
            }.bind(this))
          },
          confirmDonation: function (data) {
            this.submitting = true
            $.ajax({
              url: this.repoEndpoint + '/donate',
              data: JSON.stringify({
                amount: this.amount,
                currency: this.currency,
                from: this.from,
                token: data.token
              }),
              contentType: 'application/json',
              type: 'POST',
              success: function (data, status, xhr) {
                this.submitting = false
                if(xhr.status == 200) {
                  this.success = true
                }
                else {
                  this.errors = [xhr.body.error]
                }

              }.bind(this),
              error: function (xhr, status) {
                this.submitting = false;
                this.errors.push(xhr.responseJSON.error)
              }.bind(this)
            })
          },
          preview: function () {
            this.previewUrl = this.repoEndpoint + '/donations/preview?from=' + this.from + '&amount=' + this.amount + '&currency=' + this.currency
          },
          loadBrainBlocks: function (e) {
            e.preventDefault()
            this.errors = []
            if (!this.amount) {
              this.errors.push('Amount missing')
            }

            if (this.errors.length) {
              return
            }

            $('#brainblocks-container').html('<div id="brainblocks"></div>')

            var rendered = true
            var currency = this.currency
            console.log('this.currency',this.currency);
            if (currency == 'nano') {
              currency = 'rai'
            }
            try {
              brainblocks.Button.render({
                payment: {
                  destination: this.nanoAddress,
                  currency: currency,
                  amount: this.amount
                },
                onPayment: function(data) {
                  this.confirmDonation(data)
                }.bind(this)
              }, '#brainblocks');
            }
            catch (ex) {
              this.errors.push(ex.toString())
              rendered = false
            }

            if (rendered) {
              this.step = 2
            }
          }
        },
        data: function () {
          return {
            readme: {},
            step: 1,
            errors: [],
            amount: 0.1,
            currency: 'usd',
            from: '',
            success: false,
            loading: true,
            previewUrl: '',
            submitting: false,
            nanoAddress: DEFAULT_NANO_ADDRESS
          }
        }
      }
    }
  ]

  Vue.component('errors', {
    template: '<div class="alert alert-danger" v-if="errors.length"><div v-for="err in errors">{{err}}</div></div>',
    props: ['errors']
  })

  const router = new VueRouter({
    routes: routes
  })

  var app = new Vue({
    el: '#app',
    data: {},
    router: router
  })
  console.log('app',app);
})
console.log('hello');
