import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:image_picker/image_picker.dart";

import "../../../core/theme/app_colors.dart";
import "../../../core/theme/app_spacing.dart";
import "../../../core/ui/app_components.dart";
import "../../auth/domain/app_user.dart";
import "../../auth/presentation/auth_controller.dart";
import "../../reports/presentation/my_reports_screen.dart";

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _imagePicker = ImagePicker();

  bool _saving = false;
  bool _uploadingAvatar = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authControllerProvider).user;
    _populateControllers(user);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(authControllerProvider.notifier).refreshProfile();
    });
  }

  void _populateControllers(AppUser? user) {
    if (user == null) return;
    _firstNameController.text = user.firstName;
    _lastNameController.text = user.lastName;
    _phoneController.text = user.phone ?? "";
    _addressController.text = user.address ?? "";
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    final firstName = _firstNameController.text.trim();
    final lastName = _lastNameController.text.trim();
    final phone = _phoneController.text.trim();
    final address = _addressController.text.trim();

    if (firstName.isEmpty || lastName.isEmpty) {
      _showMessage("First and last name are required.");
      return;
    }

    setState(() => _saving = true);
    try {
      await ref.read(authControllerProvider.notifier).updateProfile(
            firstName: firstName,
            lastName: lastName,
            phone: phone.isEmpty ? null : phone,
            address: address.isEmpty ? null : address,
          );
      _showMessage("Profile updated successfully.");
    } catch (error) {
      _showMessage(error.toString());
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  Future<void> _logout() async {
    await ref.read(authControllerProvider.notifier).logout();
    if (!mounted) {
      return;
    }
    Navigator.of(context).popUntil((route) => route.isFirst);
  }

  void _confirmLogout() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.sm,
                AppSpacing.lg,
                AppSpacing.xl,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Drag Handle
                  Container(
                    width: 38,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: AppSpacing.lg),
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),

                  // Logout Avatar Badge
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: AppColors.tint(AppColors.destructive, opacity: 0.1),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: AppColors.destructive.withValues(alpha: 0.2),
                        width: 1.5,
                      ),
                    ),
                    child: const Icon(
                      Icons.logout_rounded,
                      color: AppColors.destructive,
                      size: 28,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Title & Subtitle
                  const Text(
                    "Log Out",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.4,
                      color: AppColors.foreground,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  const Text(
                    "Are you sure you want to sign out of your account? You will need to log back in to submit reports.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13.5,
                      height: 1.45,
                      color: AppColors.mutedForeground,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),

                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: SizedBox(
                          height: 48,
                          child: OutlinedButton(
                            onPressed: () => Navigator.of(ctx).pop(),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: AppColors.border),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            child: const Text(
                              "Cancel",
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                                color: AppColors.foreground,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: SizedBox(
                          height: 48,
                          child: FilledButton(
                            onPressed: () {
                              Navigator.of(ctx).pop();
                              _logout();
                            },
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.destructive,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            child: const Text(
                              "Log Out",
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Future<void> _pickAndUploadAvatar(ImageSource source) async {
    if (_uploadingAvatar || _saving) {
      return;
    }

    final photo = await _imagePicker.pickImage(
      source: source,
      imageQuality: 85,
      maxWidth: 1200,
      maxHeight: 1200,
    );

    if (photo == null) {
      return;
    }

    setState(() => _uploadingAvatar = true);
    try {
      await ref
          .read(authControllerProvider.notifier)
          .uploadAvatar(filePath: photo.path);
      _showMessage("Profile picture updated successfully.");
    } catch (error) {
      _showMessage(error.toString());
    } finally {
      if (mounted) {
        setState(() => _uploadingAvatar = false);
      }
    }
  }

  void _showMessage(String message) {
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13.5),
        ),
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.foreground,
        margin: const EdgeInsets.all(AppSpacing.md),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  void _showAvatarSourcePicker() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.md,
                AppSpacing.sm,
                AppSpacing.md,
                AppSpacing.xl,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 38,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                  const Text(
                    "Update Profile Photo",
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.3,
                      color: AppColors.foreground,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  const Text(
                    "Choose an option to update your photo",
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.mutedForeground,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  _AvatarOptionTile(
                    icon: Icons.photo_camera_rounded,
                    color: AppColors.primary,
                    title: "Take a Photo",
                    subtitle: "Use your device camera",
                    onTap: () {
                      Navigator.of(context).pop();
                      _pickAndUploadAvatar(ImageSource.camera);
                    },
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  _AvatarOptionTile(
                    icon: Icons.photo_library_rounded,
                    color: AppColors.info,
                    title: "Choose from Gallery",
                    subtitle: "Select an existing photo from library",
                    onTap: () {
                      Navigator.of(context).pop();
                      _pickAndUploadAvatar(ImageSource.gallery);
                    },
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AuthState>(authControllerProvider, (previous, next) {
      if (!_saving && next.user != null && previous?.user != next.user) {
        _populateControllers(next.user);
      }
    });

    final user = ref.watch(authControllerProvider).user;
    final avatarUrl = (user?.avatarUrl ?? "").trim();
    final hasAvatar = avatarUrl.isNotEmpty;
    final useCitizenPlaceholder =
        !hasAvatar && ((user?.role ?? "").toUpperCase() == "CITIZEN");
    ImageProvider<Object>? profileImage;
    if (hasAvatar) {
      profileImage = NetworkImage(avatarUrl);
    } else if (useCitizenPlaceholder) {
      profileImage = const AssetImage("assets/charls.png");
    }
    final initials = (user?.firstName.isNotEmpty ?? false)
        ? user!.firstName.substring(0, 1).toUpperCase()
        : "U";
    final isBusy = _saving || _uploadingAvatar;

    final roleText = (user?.role ?? "CITIZEN").toUpperCase();
    final isWorker = roleText == "FIELD_WORKER";
    final userRoleLabel = isWorker ? "Field Worker" : "Citizen Member";

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          "Profile",
          style: TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 20,
            letterSpacing: -0.4,
          ),
        ),
        centerTitle: true,
        backgroundColor: AppColors.card,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync_rounded, size: 20),
            tooltip: "Refresh Profile",
            onPressed: () {
              ref.read(authControllerProvider.notifier).refreshProfile();
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Align(
          alignment: Alignment.topCenter,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 620),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.md,
                AppSpacing.sm,
                AppSpacing.md,
                AppSpacing.xl,
              ),
              children: [
                // Hero Profile Card
                _HeroProfileCard(
                  user: user,
                  profileImage: profileImage,
                  initials: initials,
                  userRoleLabel: userRoleLabel,
                  isWorker: isWorker,
                  uploadingAvatar: _uploadingAvatar,
                  isBusy: isBusy,
                  onAvatarTap: _showAvatarSourcePicker,
                ),

                const SizedBox(height: AppSpacing.md),

                // Personal Information Form
                _PersonalInfoCard(
                  firstNameController: _firstNameController,
                  lastNameController: _lastNameController,
                  phoneController: _phoneController,
                  addressController: _addressController,
                ),

                const SizedBox(height: AppSpacing.md),

                // Account & Activity Section
                _AccountActivityCard(
                  onTapMyReports: () {
                    Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (_) => Scaffold(
                          appBar: AppBar(title: const Text("My Reports")),
                          body: const SafeArea(
                            child: MyReportsScreen(),
                          ),
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: AppSpacing.lg),

                // Save Changes Primary Button
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: FilledButton.icon(
                    onPressed: isBusy ? null : _saveProfile,
                    icon: _saving
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.check_circle_outline_rounded, size: 20),
                    label: Text(
                      _saving ? "Saving Changes..." : "Save Changes",
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        letterSpacing: -0.2,
                      ),
                    ),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: AppSpacing.sm),

                // Logout Button
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: isBusy ? null : _confirmLogout,
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      height: 50,
                      decoration: BoxDecoration(
                        color: AppColors.tint(AppColors.destructive, opacity: 0.08),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: AppColors.destructive.withValues(alpha: 0.22),
                          width: 1.2,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: AppColors.tint(AppColors.destructive, opacity: 0.15),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.logout_rounded,
                              size: 16,
                              color: AppColors.destructive,
                            ),
                          ),
                          const SizedBox(width: AppSpacing.xs),
                          const Text(
                            "Log Out",
                            style: TextStyle(
                              color: AppColors.destructive,
                              fontWeight: FontWeight.w700,
                              fontSize: 14.5,
                              letterSpacing: -0.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: AppSpacing.md),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// Hero Profile Card
// -----------------------------------------------------------------------------
class _HeroProfileCard extends StatelessWidget {
  const _HeroProfileCard({
    required this.user,
    required this.profileImage,
    required this.initials,
    required this.userRoleLabel,
    required this.isWorker,
    required this.uploadingAvatar,
    required this.isBusy,
    required this.onAvatarTap,
  });

  final AppUser? user;
  final ImageProvider<Object>? profileImage;
  final String initials;
  final String userRoleLabel;
  final bool isWorker;
  final bool uploadingAvatar;
  final bool isBusy;
  final VoidCallback onAvatarTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: AppColors.border,
          width: 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Subtle top gradient backdrop
          Container(
            height: 80,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppColors.tint(AppColors.primary, opacity: 0.08),
                  AppColors.card,
                ],
              ),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              children: [
                // Avatar with Camera Badge
                Center(
                  child: GestureDetector(
                    onTap: isBusy ? null : onAvatarTap,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(3.5),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: AppColors.primary.withValues(alpha: 0.25),
                              width: 2.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: 0.1),
                                blurRadius: 10,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: CircleAvatar(
                            radius: 46,
                            backgroundColor:
                                AppColors.tint(AppColors.primary, opacity: 0.12),
                            foregroundImage: profileImage,
                            child: profileImage == null
                                ? Text(
                                    initials,
                                    style: const TextStyle(
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 30,
                                    ),
                                  )
                                : null,
                          ),
                        ),

                        // Edit Camera Badge
                        Positioned(
                          bottom: 2,
                          right: 2,
                          child: Container(
                            padding: const EdgeInsets.all(7),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2.5),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.18),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.camera_alt_rounded,
                              size: 15,
                              color: Colors.white,
                            ),
                          ),
                        ),

                        // Uploading Spinner Overlay
                        if (uploadingAvatar)
                          Container(
                            width: 98,
                            height: 98,
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.4),
                              shape: BoxShape.circle,
                            ),
                            child: const Center(
                              child: SizedBox(
                                width: 26,
                                height: 26,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: AppSpacing.sm),

                // Name
                Text(
                  user?.fullName.isNotEmpty == true
                      ? user!.fullName
                      : "User Profile",
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.4,
                    color: AppColors.foreground,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 3),

                // Email
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.mail_outline_rounded,
                      size: 13,
                      color: AppColors.mutedForeground,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      user?.email ?? "",
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.mutedForeground,
                        fontWeight: FontWeight.w500,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.sm),

                // Role Pill & Address Tag Row
                Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    AppStatusPill(
                      label: userRoleLabel,
                      color: isWorker ? AppColors.purple : AppColors.primary,
                      icon: isWorker
                          ? Icons.engineering_outlined
                          : Icons.verified_user_outlined,
                    ),
                    if ((user?.address ?? "").trim().isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 9,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.secondary,
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.location_on_rounded,
                              size: 12,
                              color: AppColors.mutedForeground,
                            ),
                            const SizedBox(width: 3),
                            Text(
                              user!.address!.trim(),
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AppColors.secondaryForeground,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// Personal Information Card
// -----------------------------------------------------------------------------
class _PersonalInfoCard extends StatelessWidget {
  const _PersonalInfoCard({
    required this.firstNameController,
    required this.lastNameController,
    required this.phoneController,
    required this.addressController,
  });

  final TextEditingController firstNameController;
  final TextEditingController lastNameController;
  final TextEditingController phoneController;
  final TextEditingController addressController;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.tint(AppColors.primary, opacity: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.person_rounded,
                  size: 17,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: AppSpacing.xs),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    "Personal Information",
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.2,
                      color: AppColors.foreground,
                    ),
                  ),
                  Text(
                    "Update your personal and contact details",
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.mutedForeground,
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // First Name & Last Name in responsive row
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: TextField(
                  controller: firstNameController,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(
                    labelText: "First Name",
                    prefixIcon: Icon(Icons.badge_outlined, size: 19),
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: TextField(
                  controller: lastNameController,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(
                    labelText: "Last Name",
                    prefixIcon: Icon(Icons.badge_outlined, size: 19),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          // Phone Number
          TextField(
            controller: phoneController,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(
              labelText: "Phone Number",
              hintText: "e.g. +63 912 345 6789",
              prefixIcon: Icon(Icons.phone_outlined, size: 19),
            ),
          ),

          const SizedBox(height: AppSpacing.sm),

          // Address
          TextField(
            controller: addressController,
            minLines: 1,
            maxLines: 2,
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(
              labelText: "Address / Location",
              hintText: "e.g. Barangay, Street, City",
              prefixIcon: Icon(Icons.location_on_outlined, size: 19),
            ),
          ),
        ],
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// Account & Activity Card
// -----------------------------------------------------------------------------
class _AccountActivityCard extends StatelessWidget {
  const _AccountActivityCard({
    required this.onTapMyReports,
  });

  final VoidCallback onTapMyReports;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.tint(AppColors.primary, opacity: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.space_dashboard_outlined,
                  size: 17,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: AppSpacing.xs),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    "Activity & History",
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.2,
                      color: AppColors.foreground,
                    ),
                  ),
                  Text(
                    "View your community activity and submissions",
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.mutedForeground,
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          // My Reports Tile
          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onTapMyReports,
              borderRadius: BorderRadius.circular(14),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 6,
                  vertical: 8,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: AppColors.tint(AppColors.primary, opacity: 0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.assignment_turned_in_rounded,
                        color: AppColors.primary,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            "My Reports",
                            style: TextStyle(
                              fontSize: 14.5,
                              fontWeight: FontWeight.w700,
                              color: AppColors.foreground,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            "Track status of your submitted waste reports",
                            style: TextStyle(
                              fontSize: 12.5,
                              color: AppColors.mutedForeground,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: AppColors.secondary,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.chevron_right_rounded,
                        size: 18,
                        color: AppColors.mutedForeground,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// Avatar Option Tile (Camera / Gallery)
// -----------------------------------------------------------------------------
class _AvatarOptionTile extends StatelessWidget {
  const _AvatarOptionTile({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.tint(color, opacity: 0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: color.withValues(alpha: 0.2),
                    width: 1,
                  ),
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.foreground,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        fontSize: 12.5,
                        color: AppColors.mutedForeground,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right_rounded,
                color: AppColors.mutedForeground,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
