import { Component, Input } from '@angular/core'
import { Button, Icon, Item, NavController, ActionSheetController, Events, ActionSheet } from 'ionic-angular'
import { NavigationService } from '../../services/navigation/NavigationService'
import { PostService } from '../../services/api/PostService'

@Component({
  templateUrl: 'build/components/PostCard/PostCard.html',
  selector: 'post-card',
  inputs: ['post'],
  directives: [Button, Icon, Item],
})
export class PostCard {
  @Input() post
  isMyPost: boolean
  actionSheet: ActionSheet

  privateButtons: Array<any> = [{
    text: 'Delete',
    role: 'destructive',
    handler: () => {
      this.actionSheet.dismiss()
      this.postService.deletePost(this.post.postID).subscribe(() => {
        this.events.publish('feedback:show', { msg: 'Deleted!', icon: 'checkmark' })
        this.events.publish('user:posts:updated', this.post)
      })
    }
  }, {
    text: 'Cancel',
    role: 'cancel',
  }]

  publicButtons: Array<any> = [{
    text: 'Report',
    role: 'destructive',
    handler: () => {
      this.actionSheet.dismiss()
      this.postService.reportPost(this.post.postID).subscribe((result) => {
        let msg = result.json().msg
        this.events.publish('feedback:show', { msg, icon: 'checkmark' })
      })
    }
  }, {
    text: 'Cancel',
    role: 'cancel',
  }]

  constructor(private nav: NavController,
    private postService: PostService,
    private events: Events,
    private actionSheetCtrl: ActionSheetController) {
  }

  ngOnInit() {
    let currentUserID = localStorage.getItem('USER_ID')
    this.isMyPost = (currentUserID === this.post.author.userID)
  }

  openPost(event, postID) {
    event.stopPropagation()
    NavigationService.openPost(this.nav, postID)
  }

  openOptions(event) {
    event.stopPropagation()

    this.actionSheet = this.actionSheetCtrl.create({
      title: 'Post actions',
      buttons: this.isMyPost ? (this.post.resolved ? [] : [{
        text: 'Mark Done',
        handler: () => {
          this.postService.resolvePost(this.post.postID).subscribe((...args) => {
            this.events.publish('feedback:show', { msg: 'Done!', icon: 'checkmark' })
            this.events.publish('user:posts:updated', this.post)

            this.post.resolved = true
          }, () => {
            this.events.publish('feedback:show', { msg: 'Failed!', icon: 'alert' })
          })
        }
      }]).concat(this.privateButtons) : this.publicButtons
    })

    this.actionSheet.present()
  }

  noOp(event) {
    event.stopPropagation()
  }

  goToProfile(event, userID) {
    NavigationService.goToProfile(this.nav, event, userID)
  }
}
