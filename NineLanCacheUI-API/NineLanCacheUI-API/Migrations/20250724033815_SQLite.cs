using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NineLanCacheUI_API.Migrations
{
    /// <inheritdoc />
    public partial class SQLite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DownloadEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CacheIdentifier = table.Column<string>(type: "TEXT", nullable: false),
                    DownloadIdentifier = table.Column<uint>(type: "INTEGER", nullable: true),
                    DownloadIdentifierString = table.Column<string>(type: "TEXT", nullable: true),
                    ClientIp = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastUpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CacheHitBytes = table.Column<long>(type: "INTEGER", nullable: false),
                    CacheMissBytes = table.Column<long>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DownloadEvents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExcludedIps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IpAddress = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExcludedIps", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Settings",
                columns: table => new
                {
                    Key = table.Column<string>(type: "TEXT", nullable: false),
                    Value = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settings", x => x.Key);
                });

            migrationBuilder.CreateTable(
                name: "SteamDepots",
                columns: table => new
                {
                    SteamDepotId = table.Column<uint>(type: "INTEGER", nullable: false),
                    SteamAppId = table.Column<uint>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SteamDepots", x => new { x.SteamDepotId, x.SteamAppId });
                });

            migrationBuilder.CreateTable(
                name: "SteamManifests",
                columns: table => new
                {
                    DepotId = table.Column<uint>(type: "INTEGER", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TotalCompressedSize = table.Column<ulong>(type: "INTEGER", nullable: false),
                    TotalUncompressedSize = table.Column<ulong>(type: "INTEGER", nullable: false),
                    UniqueManifestIdentifier = table.Column<string>(type: "TEXT", nullable: false),
                    ManifestBytesSize = table.Column<ulong>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SteamManifests", x => new { x.DepotId, x.CreationTime });
                });

            migrationBuilder.CreateIndex(
                name: "IX_DownloadEvents_CacheIdentifier",
                table: "DownloadEvents",
                column: "CacheIdentifier");

            migrationBuilder.CreateIndex(
                name: "IX_DownloadEvents_ClientIp",
                table: "DownloadEvents",
                column: "ClientIp");

            migrationBuilder.CreateIndex(
                name: "IX_ExcludedIps_IpAddress",
                table: "ExcludedIps",
                column: "IpAddress",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SteamManifests_UniqueManifestIdentifier",
                table: "SteamManifests",
                column: "UniqueManifestIdentifier",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DownloadEvents");

            migrationBuilder.DropTable(
                name: "ExcludedIps");

            migrationBuilder.DropTable(
                name: "Settings");

            migrationBuilder.DropTable(
                name: "SteamDepots");

            migrationBuilder.DropTable(
                name: "SteamManifests");
        }
    }
}
